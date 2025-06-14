import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable, Subject, throwError, BehaviorSubject } from 'rxjs';
import { catchError, delay, mergeMap, retryWhen, take, tap, timeout } from 'rxjs/operators';

export interface ApiRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: { [key: string]: string };
  params?: { [key: string]: string };
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  tag?: string;
}

export interface ApiResponseEvent {
  request: ApiRequest;
  status: 'success' | 'timeout' | 'error';
  data?: any;
  error?: any;
}

export interface ApiProgress {
  total: number;
  completed: number;
  success: number;
  timeout: number;
  error: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiStatusSubject = new Subject<ApiResponseEvent>();
  public apiStatus$ = this.apiStatusSubject.asObservable();

  private progressSubject = new BehaviorSubject<ApiProgress>({
    total: 0,
    completed: 0,
    success: 0,
    timeout: 0,
    error: 0
  });
  public progress$ = this.progressSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchAllAsync(requests: ApiRequest[], concurrency: number = 5): void {
    const total = requests.length;
    const progress: ApiProgress = {
      total,
      completed: 0,
      success: 0,
      timeout: 0,
      error: 0
    };
    this.progressSubject.next(progress);

    from(requests).pipe(
      mergeMap(req =>
        this.makeRequest(req).pipe(
          tap(data => {
            this.apiStatusSubject.next({ request: req, status: 'success', data });
            progress.success++;
          }),
          catchError(err => {
            const isTimeout = err.name === 'TimeoutError';
            const status = isTimeout ? 'timeout' : 'error';
            this.apiStatusSubject.next({ request: req, status, error: err });
            isTimeout ? progress.timeout++ : progress.error++;
            return throwError(() => err);
          }),
          tap(() => {
            progress.completed++;
            this.progressSubject.next({ ...progress });
          })
        ),
        concurrency
      )
    ).subscribe();
  }

  private makeRequest(req: ApiRequest): Observable<any> {
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
        retryWhen(errors => errors.pipe(delay(req.retryDelayMs), take(req.retryCount)))
      );
    }

    return httpCall$;
  }
}
