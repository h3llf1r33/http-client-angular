import '@angular/compiler'
import {
    deserializeGenericFilterQuery,
    HttpClientMiddleware,
    HttpClientRequestOptions,
    HttpMethodType, IGenericFilterQuery,
    IHttpClient, serializeGenericFilterQuery,
    IHttpHeaders,
} from "@denis_bruns/web-core-ts";
import {HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http'
import {catchError, from, map, Observable, switchMap} from "rxjs";
import {createHttpClientMiddlewareFactory} from "@denis_bruns/http-client-middleware";

export class HttpClientAngular implements IHttpClient {
    private httpClient;

    constructor(
        public readonly _httpClient: HttpClient,
        public readonly baseUrl: string = "",
        private middleware: HttpClientMiddleware<HttpClientRequestOptions>[] = []
    ) {
        this.httpClient = this._httpClient;
    }

    private convertHeaders(headers: IHttpHeaders | undefined): HttpHeaders {
        if (!headers) return new HttpHeaders();
        return Object.entries(headers).reduce((httpHeaders, [key, value]) => {
            if (Array.isArray(value)) {
                return value.reduce((acc, v) => acc.append(key, v), httpHeaders);
            } else if (value !== undefined) {
                return httpHeaders.set(key, value.toString());
            }
            return httpHeaders;
        }, new HttpHeaders());
    }

    public request<T, R extends boolean = false>(
        method: HttpMethodType,
        path: string,
        options: {
            config?: HttpClientRequestOptions;
            body?: Record<string, any> | undefined;
            returnFullResponse?: R;
        },
        filterQuery?: IGenericFilterQuery
    ): Observable<R extends true ? Axios.AxiosXHR<T> : T> {
        const filterParams = filterQuery ? serializeGenericFilterQuery(filterQuery) : "";
        const initialConfig: HttpClientRequestOptions = {
            headers: {},
            ...options.config || {}
        };

        return this.buildMiddleware$(initialConfig).pipe(
            switchMap(modifiedConfig => {
                const fullUrl = this.buildFullUrl(path, filterParams);
                const httpMethod = method ? String(method).toUpperCase() : 'GET';
                const angularHeaders = this.convertHeaders(modifiedConfig.headers);

                const baseRequestOptions = {
                    headers: angularHeaders,
                    withCredentials: modifiedConfig.withCredentials || false,
                    responseType: 'json' as const,
                    body: undefined
                };

                if (options.returnFullResponse) {
                    const requestOptions = {
                        ...baseRequestOptions,
                        observe: 'response' as const
                    };

                    if (options.body !== undefined) {
                        requestOptions.body = options.body as any;
                    }

                    return this.httpClient.request<T>(httpMethod, fullUrl, requestOptions).pipe(
                        map(response => ({
                            data: response.body,
                            status: response.status,
                            statusText: response.statusText || '',
                            headers: response.headers,
                            config: {
                                ...modifiedConfig,
                                url: fullUrl,
                                method: httpMethod,
                                data: options.body,
                                headers: Object.fromEntries(response.headers.keys().map(key => [
                                    key,
                                    response.headers.get(key) || ''
                                ]))
                            }
                        }) as Axios.AxiosXHR<T>),
                        catchError((error: HttpErrorResponse) => {
                            return from([{
                                data: error.error,
                                status: error.status,
                                statusText: error.statusText || '',
                                headers: error.headers,
                                config: {
                                    ...modifiedConfig,
                                    url: fullUrl,
                                    method: httpMethod,
                                    data: options.body,
                                    headers: Object.fromEntries(error.headers.keys().map(key => [
                                        key,
                                        error.headers.get(key) || ''
                                    ]))
                                }
                            } as Axios.AxiosXHR<T>]);
                        })
                    );
                }

                const requestOptions = {
                    ...baseRequestOptions,
                    observe: 'body' as const
                };

                if (options.body !== undefined) {
                    requestOptions.body = options.body as any;
                }

                return this.httpClient.request<T>(httpMethod, fullUrl, requestOptions);
            })
        ) as Observable<R extends true ? Axios.AxiosXHR<T> : T>;
    }

    private buildFullUrl(path: string, filterParams: string): string {
        const cleanBaseUrl = (this.baseUrl || '').replace(/\/$/, '');
        const cleanPath = path.replace(/^\//, '');

        return cleanBaseUrl
            ? `${cleanBaseUrl}/${cleanPath}${filterParams || ''}`
            : `${cleanPath}${filterParams || ''}`;
    }

    private buildMiddleware$(options: HttpClientRequestOptions): Observable<HttpClientRequestOptions> {
        const middlewares$ = this.middleware.map(fn => fn(options));
        return createHttpClientMiddlewareFactory(middlewares$, options) as Observable<HttpClientRequestOptions>;
    }

    get<T>(path: string, config?: HttpClientRequestOptions, filterQuery?: IGenericFilterQuery): Observable<T> {
        return this.request<T>('GET', path, { config }, filterQuery);
    }

    post<T, D extends Record<string, any>>(path: string, body?: D, config?: HttpClientRequestOptions): Observable<T> {
        if (body === undefined) {
            return this.request<T>('POST', path, { config });
        }
        return this.request<T>('POST', path, { body, config });
    }

    put<T, D extends Record<string, any>>(path: string, body?: D, config?: HttpClientRequestOptions): Observable<T> {
        if (body === undefined) {
            return this.request<T>('PUT', path, { config });
        }
        return this.request<T>('PUT', path, { body, config });
    }

    patch<T, D extends Record<string, any>>(path: string, body?: D, config?: HttpClientRequestOptions): Observable<T> {
        if (body === undefined) {
            return this.request<T>('PATCH', path, { config });
        }
        return this.request<T>('PATCH', path, { body, config });
    }

    delete<T>(path: string, config?: HttpClientRequestOptions, filterQuery?: IGenericFilterQuery): Observable<T> {
        return this.request<T>('DELETE', path, { config }, filterQuery);
    }

    getRequest<T>(path: string, config?: HttpClientRequestOptions, filterQuery?: IGenericFilterQuery): Observable<Axios.AxiosXHR<T>> {
        return this.request<T, true>('GET', path, {
            config,
            returnFullResponse: true,
        }, filterQuery);
    }

    postRequest<T>(path: string, body?: Record<string, any>, config?: HttpClientRequestOptions): Observable<Axios.AxiosXHR<T>> {
        if (body === undefined) {
            return this.request<T, true>('POST', path, {
                config,
                returnFullResponse: true,
            });
        }
        return this.request<T, true>('POST', path, {
            body,
            config,
            returnFullResponse: true,
        });
    }

    putRequest<T>(path: string, body?: Record<string, any>, config?: HttpClientRequestOptions): Observable<Axios.AxiosXHR<T>> {
        if (body === undefined) {
            return this.request<T, true>('PUT', path, {
                config,
                returnFullResponse: true,
            });
        }
        return this.request<T, true>('PUT', path, {
            body,
            config,
            returnFullResponse: true,
        });
    }

    patchRequest<T>(path: string, body?: Record<string, any>, config?: HttpClientRequestOptions): Observable<Axios.AxiosXHR<T>> {
        if (body === undefined) {
            return this.request<T, true>('PATCH', path, {
                config,
                returnFullResponse: true,
            });
        }
        return this.request<T, true>('PATCH', path, {
            body,
            config,
            returnFullResponse: true,
        });
    }

    deleteRequest<T>(path: string, config?: HttpClientRequestOptions): Observable<Axios.AxiosXHR<T>> {
        return this.request<T, true>('DELETE', path, {
            config,
            returnFullResponse: true,
        });
    }

    parseUrlToGenericFilterQuery(url: string): IGenericFilterQuery {
        const urlObj = new URL(url, this.baseUrl);
        return deserializeGenericFilterQuery(urlObj.search);
    }
}