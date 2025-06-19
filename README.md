private makeRequest(req: IFTUIApiRequest): Observable<any> {
  const options = {
    headers: new HttpHeaders(req.headers || {}),
    params: new HttpParams({ fromObject: req.params || {} })
  };

  let httpCall$: Observable<any>;

  switch (req.method) {
    case 'GET':
      httpCall$ = this.http.get(req.url, options);
      break;
    case 'POST':
      httpCall$ = this.http.post(req.url, req.body, options);
      break;
    case 'PUT':
      httpCall$ = this.http.put(req.url, req.body, options);
      break;
    case 'DELETE':
      httpCall$ = this.http.delete(req.url, options);
      break;
    case 'PATCH':
      httpCall$ = this.http.patch(req.url, req.body, options);
      break;
    default:
      return throwError(() => new Error(`Unsupported method: ${req.method}`));
  }

  // Apply timeout if configured
  if (req.timeoutMs) {
    httpCall$ = httpCall$.pipe(timeout(req.timeoutMs));
  }

  // Apply retry with delay logic if configured
  if (req.retryCount && req.retryDelayMs) {
    httpCall$ = httpCall$.pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            if (acc >= req.retryCount!) {
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(req.retryDelayMs)
        )
      )
    );
  }

  return httpCall$;
}
