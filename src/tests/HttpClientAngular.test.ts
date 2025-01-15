import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, lastValueFrom } from 'rxjs';
import { HttpClientMiddleware, HttpClientRequestOptions } from '@denis_bruns/web-core-ts';
import { HttpClientAngular } from "../client/HttpClientAngular";

describe('HttpClientAngular', () => {
    let httpClient: HttpClientAngular;
    let httpMock: HttpTestingController;
    const baseUrl = 'https://api.example.com';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: []
        });

        const http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        httpClient = new HttpClientAngular(http, baseUrl);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('request method', () => {
        it('should make a basic GET request', async () => {
            const mockData = { id: 1, name: 'Test' };

            const promise = lastValueFrom(httpClient.get<typeof mockData>('/test'));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockData);

            const result = await promise;
            expect(result).toEqual(mockData);
        });

        it('should apply middleware correctly', async () => {
            const middleware: HttpClientMiddleware<HttpClientRequestOptions> =
                (config) => of({
                    ...config,
                    headers: { ...config.headers, 'X-Test': 'test-value' }
                });

            const clientWithMiddleware = new HttpClientAngular(TestBed.inject(HttpClient), baseUrl, [middleware]);
            const mockData = { id: 1 };

            const promise = lastValueFrom(clientWithMiddleware.get<typeof mockData>('/test'));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.headers.get('X-Test')).toBe('test-value');
            req.flush(mockData);

            const result = await promise;
            expect(result).toEqual(mockData);
        });

        it('should return full response when returnFullResponse is true', async () => {
            const mockData = { id: 1 };

            const promise = lastValueFrom(
                httpClient.request<typeof mockData, true>('GET', '/test', { returnFullResponse: true })
            );

            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockData, {
                headers: new HttpHeaders().set('Custom-Header', 'test')
            });

            const result = await promise;
            expect(result.data).toEqual(mockData);
            expect(result.status).toBe(200);
            expect(result.headers.get('Custom-Header')).toBe('test');
        });
    });

    describe('HTTP methods', () => {
        const mockData = { id: 1 };

        it('should handle POST requests with body', async () => {
            const body = { name: 'test' };

            const promise = lastValueFrom(httpClient.post<typeof mockData, typeof body>('/test', body));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('POST');
            expect(req.request.body).toEqual(body);
            req.flush(mockData);

            const result = await promise;
            expect(result).toEqual(mockData);
        });

        it('should handle PUT requests with body', async () => {
            const body = { name: 'test' };

            const promise = lastValueFrom(httpClient.put<typeof mockData, typeof body>('/test', body));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('PUT');
            expect(req.request.body).toEqual(body);
            req.flush(mockData);

            const result = await promise;
            expect(result).toEqual(mockData);
        });

        it('should handle PATCH requests with body', async () => {
            const body = { name: 'test' };

            const promise = lastValueFrom(httpClient.patch<typeof mockData, typeof body>('/test', body));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('PATCH');
            expect(req.request.body).toEqual(body);
            req.flush(mockData);

            const result = await promise;
            expect(result).toEqual(mockData);
        });

        it('should handle DELETE requests', async () => {
            const promise = lastValueFrom(httpClient.delete<typeof mockData>('/test'));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('DELETE');
            req.flush(mockData);

            const result = await promise;
            expect(result).toEqual(mockData);
        });
    });

    describe('Request methods with full response', () => {
        const mockData = { id: 1 };

        it('should handle getRequest', async () => {
            const promise = lastValueFrom(httpClient.getRequest<typeof mockData>('/test'));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockData, {
                headers: new HttpHeaders().set('Custom-Header', 'test')
            });

            const result = await promise;
            expect(result.data).toEqual(mockData);
            expect(result.status).toBe(200);
        });

        it('should handle postRequest', async () => {
            const body = { name: 'test' };

            const promise = lastValueFrom(httpClient.postRequest<typeof mockData>('/test', body));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('POST');
            expect(req.request.body).toEqual(body);
            req.flush(mockData);

            const result = await promise;
            expect(result.data).toEqual(mockData);
        });
    });

    it('should handle requests without baseUrl', async () => {
        const clientWithoutBase = new HttpClientAngular(TestBed.inject(HttpClient));
        const mockData = { id: 1 };

        const promise = lastValueFrom(clientWithoutBase.get<typeof mockData>('test'));

        const req = httpMock.expectOne('test');  // Should be just 'test' without leading slash
        expect(req.request.method).toEqual('GET');
        req.flush(mockData);

        const result = await promise;
        expect(result).toEqual(mockData);
    });

    describe('Error handling', () => {
        it('should handle HTTP errors', async () => {
            const errorResponse = { message: 'Not Found' };

            const promise = lastValueFrom(httpClient.getRequest<any>('/test'));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            req.flush(errorResponse, { status: 404, statusText: 'Not Found' });

            const result = await promise;
            expect(result.status).toBe(404);
            expect(result.data).toEqual(errorResponse);
        });
    });

    describe('Edge cases', () => {
        it('should handle undefined body in POST requests', async () => {
            const promise = lastValueFrom(httpClient.post<any, any>('/test', undefined));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('POST');
            expect(req.request.body).toBeNull();
            req.flush(null);

            await promise;
        });

        it('should handle empty response body', async () => {
            const promise = lastValueFrom(httpClient.get<null>('/test'));

            const req = httpMock.expectOne(`${baseUrl}/test`);
            req.flush(null, { status: 204, statusText: 'No Content' });

            const result = await promise;
            expect(result).toBeNull();
        });
    });
});