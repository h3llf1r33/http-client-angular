import '@angular/compiler'
import {
    deserializeGenericFilterQuery,
    HttpClientMiddleware,
    HttpClientRequestOptions,
    HttpMethodType, IGenericFilterQuery,
    IHttpClient, serializeGenericFilterQuery
} from "@denis_bruns/foundation";
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http'
import {from, map, Observable, switchMap} from "rxjs";
import {createHttpClientMiddlewareFactory} from "@denis_bruns/http-client-middleware";

export class HttpClientAngular implements IHttpClient {
    private httpClient;

    constructor(
        public readonly _httpClient: HttpClient,
        public readonly baseUrl: string = "",
        private middleware: HttpClientMiddleware<HttpClientRequestOptions>[] = []
    ) {
        this.httpClient = this._httpClient
    }

    public request<T, R extends boolean = false>(
        method: HttpMethodType,
        path: string,
        options: {
            config?: HttpClientRequestOptions;
            body?: Record<string, any>;
            returnFullResponse?: R;
        },
        filterQuery?: IGenericFilterQuery
    ): Observable<R extends true ? Axios.AxiosXHR<T> : T> {
        const filterParams = filterQuery ? serializeGenericFilterQuery(filterQuery) : "";
        const initialConfig: HttpClientRequestOptions = {
            headers: {},
            ...options.config || {}
        };
        initialConfig.baseURL = this.baseUrl;

        return this.buildMiddleware$(initialConfig).pipe(
            switchMap(modifiedConfig => {
                const fullUrl = `${path}${filterParams}`;
                const httpMethod = method ? String(method).toUpperCase() : 'GET';

                const request$ = from(this.httpClient.request<T>(httpMethod, fullUrl, {
                    body: options.body,
                    headers: modifiedConfig.headers as any,
                    withCredentials: modifiedConfig.withCredentials || false,
                    reportProgress: true,
                    responseType: modifiedConfig.responseType as any,
                    params: new HttpParams()
                }));

                if (options.returnFullResponse) {
                    return request$;
                }

                return request$.pipe(map((value) => {
                    return (value as HttpResponse<T>).body ?? value;
                }));
            })
        ) as Observable<R extends true ? Axios.AxiosXHR<T> : T>;
    }

    get<T>(path: string, config?: HttpClientRequestOptions, filterQuery?: IGenericFilterQuery): Observable<T> {
        return this.request<T>('GET', path, {config}, filterQuery);
    }

    post<T, D extends Record<string, any>>(path: string, body?: D, config?: HttpClientRequestOptions): Observable<T> {
        return this.request<T>('POST', path, {body, config});
    }

    put<T, D extends Record<string, any>>(path: string, body?: D, config?: HttpClientRequestOptions): Observable<T> {
        return this.request<T>('PUT', path, {body, config});
    }

    patch<T, D extends Record<string, any>>(path: string, body?: D, config?: HttpClientRequestOptions): Observable<T> {
        return this.request<T>('PATCH', path, {body, config});
    }

    delete<T>(path: string, config?: HttpClientRequestOptions, filterQuery?: IGenericFilterQuery): Observable<T> {
        return this.request<T>('DELETE', path, {config}, filterQuery);
    }

    getRequest<T>(path: string, config?: HttpClientRequestOptions, filterQuery?: IGenericFilterQuery): Observable<Axios.AxiosXHR<T>> {
        return this.request<T, true>('GET', path, {
            config,
            returnFullResponse: true,
        }, filterQuery)
    }

    postRequest<T>(path: string, body?: Record<string, any>, config?: HttpClientRequestOptions): Observable<Axios.AxiosXHR<T>> {
        return this.request<T, true>('POST', path, {
            body,
            config,
            returnFullResponse: true,
        })
    }

    putRequest<T>(path: string, body?: Record<string, any>, config?: HttpClientRequestOptions): Observable<Axios.AxiosXHR<T>> {
        return this.request<T, true>('PUT', path, {
            body,
            config,
            returnFullResponse: true,
        })
    }

    patchRequest<T>(path: string, body?: Record<string, any>, config?: HttpClientRequestOptions): Observable<Axios.AxiosXHR<T>> {
        return this.request<T, true>('PATCH', path, {
            body,
            config,
            returnFullResponse: true,
        })
    }

    deleteRequest<T>(path: string, config?: HttpClientRequestOptions): Observable<Axios.AxiosXHR<T>> {
        return this.request<T, true>('DELETE', path, {
            config,
            returnFullResponse: true,
        })
    }

    /**
     * Utility method to parse a URL and extract IGenericFilterQuery.
     * This can be used outside the HttpClient if needed.
     * @param url The full URL string.
     * @returns The deserialized generic filter query.
     */
    parseUrlToGenericFilterQuery(url: string): IGenericFilterQuery {
        const urlObj = new URL(url, this.baseUrl);
        return deserializeGenericFilterQuery(urlObj.search);
    }

    private buildMiddleware$(options: HttpClientRequestOptions): Observable<HttpClientRequestOptions> {
        const middlewares$ = this.middleware.map(fn => fn(options));
        return createHttpClientMiddlewareFactory(middlewares$, options) as Observable<HttpClientRequestOptions>;
    }
}