# @denis_bruns/http-client-angular

> **An Angular HTTP client implementation with middleware support**  
> Built on top of Angular’s HttpClient and RxJS, this package provides a type‑safe HTTP client with composable middleware for request configuration and transformation. It leverages core types from `@denis_bruns/web-core-ts` and uses middleware from `@denis_bruns/http-client-middleware` for a modular, testable HTTP request pipeline.

[![NPM Version](https://img.shields.io/npm/v/@denis_bruns/http-client-angular?style=flat-square&logo=npm)](https://www.npmjs.com/package/@denis_bruns/http-client-angular)  
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)  
[![GitHub](https://img.shields.io/badge/GitHub-181717.svg?style=flat-square&logo=github)](https://github.com/h3llf1r33/http-client-angular)

---

## Overview

`@denis_bruns/http-client-angular` offers a robust, middleware-driven HTTP client for Angular applications. It wraps Angular’s standard `HttpClient` to provide:

- **Type‑safe request configurations** using interfaces defined in `@denis_bruns/web-core-ts`
- **Middleware support** so you can inject headers, query parameters, or other modifications before sending a request
- Helper methods for standard HTTP methods (GET, POST, PUT, PATCH, DELETE) as well as versions that return the full Axios‑like response
- Seamless integration with other packages in the `@denis_bruns` ecosystem

---

## Key Features

- **RxJS-based Pipeline:**  
  All request methods return an Observable, allowing you to compose or transform the HTTP flow using RxJS operators.

- **Middleware Composition:**  
  Supports a chain of middleware (using `@denis_bruns/http-client-middleware`) to modify or enrich request options before the HTTP call executes.

- **Angular Integration:**  
  Uses Angular's `HttpClient` for performing actual HTTP requests and converts header objects to Angular’s `HttpHeaders`.

- **Flexible Request Methods:**  
  Provides standard methods (get, post, put, patch, delete) along with variants that return full Axios‑like response objects.

- **Query String Serialization:**  
  Offers utilities to serialize and deserialize filter queries using types from `@denis_bruns/web-core-ts`.

---

## Installation

Install via **npm**:

```bash
npm install @denis_bruns/http-client-angular
```

Or via **yarn**:

```bash
yarn add @denis_bruns/http-client-angular
```

Also ensure you have the following dependencies installed:

```bash
npm install @angular/common rxjs @denis_bruns/web-core-ts @denis_bruns/http-client-middleware
```

---

## Basic Usage

Below is an example of how to create and use the Angular HTTP client:

```ts
// Import Angular HttpClient (typically provided in an Angular service or component)
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HttpClientAngular } from '@denis_bruns/http-client-angular';
import { HttpClientRequestOptions } from '@denis_bruns/web-core-ts';

// Example: Custom middleware that adds a header
import { of } from 'rxjs';
import { HttpClientMiddleware } from '@denis_bruns/web-core-ts';

const addCustomHeaderMiddleware: HttpClientMiddleware<HttpClientRequestOptions> = (config) => {
  return of({
    ...config,
    headers: { ...config.headers, 'X-Custom-Header': 'custom-value' }
  });
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private client: HttpClientAngular;

  constructor(private http: HttpClient) {
    // Create an instance with a base URL and middleware chain
    this.client = new HttpClientAngular(http, 'https://api.example.com', [addCustomHeaderMiddleware]);
  }

  async getData<T>(endpoint: string): Promise<T> {
    return lastValueFrom(this.client.get<T>(endpoint));
  }

  async createData<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    return lastValueFrom(this.client.post<T, Record<string, any>>(endpoint, body));
  }
}
```

### Explanation

- **HttpClientAngular:**  
  Wraps Angular’s `HttpClient` and uses a middleware factory to modify request options before making requests.

- **Middleware:**  
  You can inject middleware (e.g., `addCustomHeaderMiddleware`) that will merge with the default configuration. The middleware chain is composed using `createHttpClientMiddlewareFactory`.

- **Helper Methods:**  
  The client provides methods like `get`, `post`, `put`, `patch`, and `delete`, as well as methods (like `getRequest`) that return the full response.

---

## Advanced Usage

### Returning Full Response

To receive the complete response (not just the data), use methods like `getRequest`:

```ts
async function fetchFullData<T>() {
  const response = await lastValueFrom(httpClient.getRequest<T>('/endpoint'));
  console.log('Status:', response.status);
  console.log('Response headers:', response.headers);
  console.log('Data:', response.data);
}
```

### Middleware Factory

You can compose multiple middleware functions using the provided middleware factory. For example:

```ts
import { createHttpClientMiddlewareFactory } from '@denis_bruns/http-client-middleware';

// Compose your middleware functions (each returns an Observable of HttpClientRequestOptions)
const middleware1$ = of({ headers: { 'X-Test-1': 'value1' } });
const middleware2$ = of({ headers: { 'X-Test-2': 'value2' } });

const combinedMiddleware$ = createHttpClientMiddlewareFactory([middleware1$, middleware2$], { headers: {} });
combinedMiddleware$.subscribe(config => {
  console.log('Final merged config:', config);
});
```

---

## Related Packages

- **@denis_bruns/web-core-ts**  
  [![NPM](https://img.shields.io/npm/v/@denis_bruns/web-core-ts?style=flat-square&logo=npm)](https://www.npmjs.com/package/@denis_bruns/web-core-ts)  
  [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github)](https://github.com/h3llf1r33/web-core-ts)  
  *Provides core interfaces and types for HTTP client configuration and clean architecture.*

- **@denis_bruns/http-client-middleware**  
  [![NPM](https://img.shields.io/npm/v/@denis_bruns/http-client-middleware?style=flat-square&logo=npm)](https://www.npmjs.com/package/@denis_bruns/http-client-middleware)
- [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github)](https://github.com/h3llf1r33/http-client-middleware)
  *A middleware framework that integrates with this client to modify HTTP request options.*

---

## Contributing

Contributions, enhancements, bug reports, or feature requests are welcome!  
Feel free to open an issue or submit a pull request on [GitHub](https://github.com/h3llf1r33/http-client-angular).

---

## License

This project is [MIT licensed](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/h3llf1r33">h3llf1r33</a>
</p>