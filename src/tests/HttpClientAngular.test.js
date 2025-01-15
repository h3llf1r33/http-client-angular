"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("@angular/common/http");
const testing_1 = require("@angular/common/http/testing");
const testing_2 = require("@angular/core/testing");
const rxjs_1 = require("rxjs");
const HttpClientAngular_1 = require("../client/HttpClientAngular");
describe('HttpClientAngular', () => {
    let httpClient;
    let httpMock;
    const baseUrl = 'https://api.example.com';
    beforeEach(() => {
        testing_2.TestBed.configureTestingModule({
            imports: [testing_1.HttpClientTestingModule],
            providers: []
        });
        const http = testing_2.TestBed.inject(http_1.HttpClient);
        httpMock = testing_2.TestBed.inject(testing_1.HttpTestingController);
        httpClient = new HttpClientAngular_1.HttpClientAngular(http, baseUrl);
    });
    afterEach(() => {
        httpMock.verify();
    });
    describe('request method', () => {
        it('should make a basic GET request', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockData = { id: 1, name: 'Test' };
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.get('/test'));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockData);
            const result = yield promise;
            expect(result).toEqual(mockData);
        }));
        it('should apply middleware correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const middleware = (config) => (0, rxjs_1.of)(Object.assign(Object.assign({}, config), { headers: Object.assign(Object.assign({}, config.headers), { 'X-Test': 'test-value' }) }));
            const clientWithMiddleware = new HttpClientAngular_1.HttpClientAngular(testing_2.TestBed.inject(http_1.HttpClient), baseUrl, [middleware]);
            const mockData = { id: 1 };
            const promise = (0, rxjs_1.lastValueFrom)(clientWithMiddleware.get('/test'));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.headers.get('X-Test')).toBe('test-value');
            req.flush(mockData);
            const result = yield promise;
            expect(result).toEqual(mockData);
        }));
        it('should return full response when returnFullResponse is true', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockData = { id: 1 };
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.request('GET', '/test', { returnFullResponse: true }));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockData, {
                headers: new http_1.HttpHeaders().set('Custom-Header', 'test')
            });
            const result = yield promise;
            expect(result.data).toEqual(mockData);
            expect(result.status).toBe(200);
            expect(result.headers.get('Custom-Header')).toBe('test');
        }));
    });
    describe('HTTP methods', () => {
        const mockData = { id: 1 };
        it('should handle POST requests with body', () => __awaiter(void 0, void 0, void 0, function* () {
            const body = { name: 'test' };
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.post('/test', body));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('POST');
            expect(req.request.body).toEqual(body);
            req.flush(mockData);
            const result = yield promise;
            expect(result).toEqual(mockData);
        }));
        it('should handle PUT requests with body', () => __awaiter(void 0, void 0, void 0, function* () {
            const body = { name: 'test' };
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.put('/test', body));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('PUT');
            expect(req.request.body).toEqual(body);
            req.flush(mockData);
            const result = yield promise;
            expect(result).toEqual(mockData);
        }));
        it('should handle PATCH requests with body', () => __awaiter(void 0, void 0, void 0, function* () {
            const body = { name: 'test' };
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.patch('/test', body));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('PATCH');
            expect(req.request.body).toEqual(body);
            req.flush(mockData);
            const result = yield promise;
            expect(result).toEqual(mockData);
        }));
        it('should handle DELETE requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.delete('/test'));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('DELETE');
            req.flush(mockData);
            const result = yield promise;
            expect(result).toEqual(mockData);
        }));
    });
    describe('Request methods with full response', () => {
        const mockData = { id: 1 };
        it('should handle getRequest', () => __awaiter(void 0, void 0, void 0, function* () {
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.getRequest('/test'));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockData, {
                headers: new http_1.HttpHeaders().set('Custom-Header', 'test')
            });
            const result = yield promise;
            expect(result.data).toEqual(mockData);
            expect(result.status).toBe(200);
        }));
        it('should handle postRequest', () => __awaiter(void 0, void 0, void 0, function* () {
            const body = { name: 'test' };
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.postRequest('/test', body));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('POST');
            expect(req.request.body).toEqual(body);
            req.flush(mockData);
            const result = yield promise;
            expect(result.data).toEqual(mockData);
        }));
    });
    describe('Error handling', () => {
        it('should handle HTTP errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const errorResponse = { message: 'Not Found' };
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.getRequest('/test'));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            req.flush(errorResponse, { status: 404, statusText: 'Not Found' });
            const result = yield promise;
            expect(result.status).toBe(404);
            expect(result.data).toEqual(errorResponse);
        }));
    });
    describe('Edge cases', () => {
        it('should handle undefined body in POST requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.post('/test', undefined));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            expect(req.request.method).toEqual('POST');
            expect(req.request.body).toBeNull();
            req.flush(null);
            yield promise;
        }));
        it('should handle empty response body', () => __awaiter(void 0, void 0, void 0, function* () {
            const promise = (0, rxjs_1.lastValueFrom)(httpClient.get('/test'));
            const req = httpMock.expectOne(`${baseUrl}/test`);
            req.flush(null, { status: 204, statusText: 'No Content' });
            const result = yield promise;
            expect(result).toBeNull();
        }));
    });
});
