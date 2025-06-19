import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError, from, of, timer } from 'rxjs';
import { catchError, mergeMap, tap, timeout, retry, switchMap } from 'rxjs/operators';

export interface IFTUIApiRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: { [key: string]: string };
  params?: { [key: string]: string };
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  tag?: string;
  returnModel?: new (...args: any[]) => any;
}

export interface IFTUIApiResponseEvent<T = any> {
  request: IFTUIApiRequest;
  status: 'success' | 'timeout' | 'error';
  data?: T;
  error?: any;
}

export interface IFTUIApiProgress {
  total: number;
  completed: number;
  success: number;
  timeout: number;
  error: number;
  tags: {
    success: string[];
    timeout: string[];
    error: string[];
  };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private requestBatch$ = new Subject<IFTUIApiRequest[]>();
  private apiStatusSubject = new Subject<IFTUIApiResponseEvent<any>>();
  public apiStatus$ = this.apiStatusSubject.asObservable();

  private progressSubject = new BehaviorSubject<IFTUIApiProgress>({
    total: 0,
    completed: 0,
    success: 0,
    timeout: 0,
    error: 0,
    tags: { success: [], timeout: [], error: [] }
  });
  public progress$ = this.progressSubject.asObservable();

  constructor(private http: HttpClient) {
    this.requestBatch$
      .pipe(
        switchMap(requests => this.processBatch(requests))
      )
      .subscribe(); // fire and forget
  }

  /** Call this when a new batch of requests is needed */
  fetchAllAsync(requests: IFTUIApiRequest[], concurrency: number = 5): void {
    this.requestBatch$.next(requests.map(r => ({ ...r, concurrency })));
  }

  /** Internal batch processor */
  private processBatch(requests: IFTUIApiRequest[]): Observable<any> {
    const total = requests.length;
    const progress: IFTUIApiProgress = {
      total,
      completed: 0,
      success: 0,
      timeout: 0,
      error: 0,
      tags: { success: [], timeout: [], error: [] }
    };
    this.progressSubject.next(progress);

    return from(requests).pipe(
      mergeMap(req =>
        this.makeRequest(req).pipe(
          tap(data => {
            const result = req.returnModel ? new req.returnModel(data) : data;
            this.apiStatusSubject.next({ request: req, status: 'success', data: result });
            progress.success++;
            if (req.tag) progress.tags.success.push(req.tag);
          }),
          catchError(err => {
            const isTimeout = err.name === 'TimeoutError';
            const status = isTimeout ? 'timeout' : 'error';

            const errorPayload = {
              message: err.message || 'Unknown error',
              name: err.name || '',
              status: err.status || 0,
              statusText: err.statusText || '',
              error: err.error || null,
              originalError: err
            };

            this.apiStatusSubject.next({ request: req, status, error: errorPayload });

            if (isTimeout) {
              progress.timeout++;
              if (req.tag) progress.tags.timeout.push(req.tag);
            } else {
              progress.error++;
              if (req.tag) progress.tags.error.push(req.tag);
            }

            return of(null);
          }),
          tap({
            next: () => {
              progress.completed++;
              this.progressSubject.next({ ...progress });
            },
            error: () => {
              progress.completed++;
              this.progressSubject.next({ ...progress });
            }
          })
        ),
        req.concurrency ?? 5 // optional per-request concurrency fallback
      )
    );
  }

  private makeRequest(req: IFTUIApiRequest): Observable<any> {
    const options = {
      headers: new HttpHeaders(req.headers || {}),
      params: new HttpParams({ fromObject: req.params || {} })
    };

    let httpCall$: Observable<any>;
    switch (req.method) {
      case 'GET': httpCall$ = this.http.get(req.url, options); break;
      case 'POST': httpCall$ = this.http.post(req.url, req.body, options); break;
      case 'PUT': httpCall$ = this.http.put(req.url, req.body, options); break;
      case 'DELETE': httpCall$ = this.http.delete(req.url, options); break;
      case 'PATCH': httpCall$ = this.http.patch(req.url, req.body, options); break;
      default: return throwError(() => new Error(`Unsupported method: ${req.method}`));
    }

    if (req.timeoutMs) {
      httpCall$ = httpCall$.pipe(timeout(req.timeoutMs));
    }

    if (req.retryCount && req.retryDelayMs) {
      httpCall$ = httpCall$.pipe(
        retry({
          count: req.retryCount,
          delay: () => timer(req.retryDelayMs)
        })
      );
    }

    return httpCall$;
  }
}
