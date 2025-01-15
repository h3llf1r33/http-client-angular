"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClientAngular = void 0;
require("@angular/compiler");
const web_core_ts_1 = require("@denis_bruns/web-core-ts");
const http_1 = require("@angular/common/http");
const rxjs_1 = require("rxjs");
const http_client_middleware_1 = require("@denis_bruns/http-client-middleware");
class HttpClientAngular {
    constructor(_httpClient, baseUrl = "", middleware = []) {
        this._httpClient = _httpClient;
        this.baseUrl = baseUrl;
        this.middleware = middleware;
        this.httpClient = this._httpClient;
    }
    convertHeaders(headers) {
        if (!headers)
            return new http_1.HttpHeaders();
        return Object.entries(headers).reduce((httpHeaders, [key, value]) => {
            if (Array.isArray(value)) {
                return value.reduce((acc, v) => acc.append(key, v), httpHeaders);
            }
            else if (value !== undefined) {
                return httpHeaders.set(key, value.toString());
            }
            return httpHeaders;
        }, new http_1.HttpHeaders());
    }
    request(method, path, options, filterQuery) {
        const filterParams = filterQuery ? (0, web_core_ts_1.serializeGenericFilterQuery)(filterQuery) : "";
        const initialConfig = Object.assign({ headers: {} }, options.config || {});
        return this.buildMiddleware$(initialConfig).pipe((0, rxjs_1.switchMap)(modifiedConfig => {
            const fullUrl = this.buildFullUrl(path, filterParams);
            const httpMethod = method ? String(method).toUpperCase() : 'GET';
            const angularHeaders = this.convertHeaders(modifiedConfig.headers);
            const baseRequestOptions = {
                headers: angularHeaders,
                withCredentials: modifiedConfig.withCredentials || false,
                responseType: 'json',
                body: undefined
            };
            if (options.returnFullResponse) {
                const requestOptions = Object.assign(Object.assign({}, baseRequestOptions), { observe: 'response' });
                if (options.body !== undefined) {
                    requestOptions.body = options.body;
                }
                return this.httpClient.request(httpMethod, fullUrl, requestOptions).pipe((0, rxjs_1.map)(response => ({
                    data: response.body,
                    status: response.status,
                    statusText: response.statusText || '',
                    headers: response.headers,
                    config: Object.assign(Object.assign({}, modifiedConfig), { url: fullUrl, method: httpMethod, data: options.body, headers: Object.fromEntries(response.headers.keys().map(key => [
                            key,
                            response.headers.get(key) || ''
                        ])) })
                })), (0, rxjs_1.catchError)((error) => {
                    return (0, rxjs_1.from)([{
                            data: error.error,
                            status: error.status,
                            statusText: error.statusText || '',
                            headers: error.headers,
                            config: Object.assign(Object.assign({}, modifiedConfig), { url: fullUrl, method: httpMethod, data: options.body, headers: Object.fromEntries(error.headers.keys().map(key => [
                                    key,
                                    error.headers.get(key) || ''
                                ])) })
                        }]);
                }));
            }
            const requestOptions = Object.assign(Object.assign({}, baseRequestOptions), { observe: 'body' });
            if (options.body !== undefined) {
                requestOptions.body = options.body;
            }
            return this.httpClient.request(httpMethod, fullUrl, requestOptions);
        }));
    }
    buildFullUrl(path, filterParams) {
        const cleanBaseUrl = this.baseUrl.replace(/\/$/, '');
        const cleanPath = path.replace(/^\//, '');
        return `${cleanBaseUrl}/${cleanPath}${filterParams}`;
    }
    buildMiddleware$(options) {
        const middlewares$ = this.middleware.map(fn => fn(options));
        return (0, http_client_middleware_1.createHttpClientMiddlewareFactory)(middlewares$, options);
    }
    get(path, config, filterQuery) {
        return this.request('GET', path, { config }, filterQuery);
    }
    post(path, body, config) {
        if (body === undefined) {
            return this.request('POST', path, { config });
        }
        return this.request('POST', path, { body, config });
    }
    put(path, body, config) {
        if (body === undefined) {
            return this.request('PUT', path, { config });
        }
        return this.request('PUT', path, { body, config });
    }
    patch(path, body, config) {
        if (body === undefined) {
            return this.request('PATCH', path, { config });
        }
        return this.request('PATCH', path, { body, config });
    }
    delete(path, config, filterQuery) {
        return this.request('DELETE', path, { config }, filterQuery);
    }
    getRequest(path, config, filterQuery) {
        return this.request('GET', path, {
            config,
            returnFullResponse: true,
        }, filterQuery);
    }
    postRequest(path, body, config) {
        if (body === undefined) {
            return this.request('POST', path, {
                config,
                returnFullResponse: true,
            });
        }
        return this.request('POST', path, {
            body,
            config,
            returnFullResponse: true,
        });
    }
    putRequest(path, body, config) {
        if (body === undefined) {
            return this.request('PUT', path, {
                config,
                returnFullResponse: true,
            });
        }
        return this.request('PUT', path, {
            body,
            config,
            returnFullResponse: true,
        });
    }
    patchRequest(path, body, config) {
        if (body === undefined) {
            return this.request('PATCH', path, {
                config,
                returnFullResponse: true,
            });
        }
        return this.request('PATCH', path, {
            body,
            config,
            returnFullResponse: true,
        });
    }
    deleteRequest(path, config) {
        return this.request('DELETE', path, {
            config,
            returnFullResponse: true,
        });
    }
    parseUrlToGenericFilterQuery(url) {
        const urlObj = new URL(url, this.baseUrl);
        return (0, web_core_ts_1.deserializeGenericFilterQuery)(urlObj.search);
    }
}
exports.HttpClientAngular = HttpClientAngular;
