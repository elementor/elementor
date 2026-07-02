import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { httpService, registerUrlForCache } from '../http';

jest.mock( 'axios', () => ( {
	...jest.requireActual( 'axios' ),
	create: jest.fn(),
} ) );

jest.mock( '../env', () => ( {
	env: { base_url: 'http://test.com', headers: {} },
} ) );

type RetryConfig = {
	__retryCount?: number;
	__baseTimeout?: number;
	method?: string;
	timeout?: number;
};

type FakeAxiosError = {
	config: RetryConfig;
	response?: { status: number };
};

const mockAxiosInstance = Object.assign( jest.fn(), {
	interceptors: {
		request: {
			use: jest.fn(),
		},
		response: {
			use: jest.fn(),
		},
	},
} );

( axios.create as jest.Mock ).mockReturnValue( mockAxiosInstance );

const makeError = ( status?: number, retryCount?: number, method?: string, timeout?: number ): FakeAxiosError => {
	const config: RetryConfig = {
		...( retryCount !== undefined && { __retryCount: retryCount } ),
		...( method !== undefined && { method } ),
		...( timeout !== undefined && { timeout } ),
	};
	return {
		config,
		response: status !== undefined ? { status } : undefined,
	};
};

describe( 'httpService', () => {
	let onRequestIntercept: ( config: InternalAxiosRequestConfig ) => InternalAxiosRequestConfig;
	let onSuccess: ( response: AxiosResponse ) => AxiosResponse;
	let onError: ( error: unknown ) => Promise< unknown >;

	// Captured before any afterEach(() => jest.clearAllMocks()) can wipe them
	let capturedCreateConfig: unknown;
	let capturedRequestInterceptorCount: number;
	let capturedResponseInterceptorCount: number;

	beforeAll( () => {
		httpService();

		const requestUseMock = mockAxiosInstance.interceptors.request.use as jest.Mock;
		const responseUseMock = mockAxiosInstance.interceptors.response.use as jest.Mock;
		capturedCreateConfig = ( axios.create as jest.Mock ).mock.calls[ 0 ]?.[ 0 ];
		capturedRequestInterceptorCount = requestUseMock.mock.calls.length;
		capturedResponseInterceptorCount = responseUseMock.mock.calls.length;
		[ onRequestIntercept ] = requestUseMock.mock.calls[ 0 ];
		[ onSuccess, onError ] = responseUseMock.mock.calls[ 0 ];
	} );

	describe( 'initialization', () => {
		it( 'creates the axios instance with the correct base config', () => {
			expect( capturedCreateConfig ).toEqual( {
				baseURL: 'http://test.com',
				timeout: 10000,
				headers: { 'Content-Type': 'application/json' },
			} );
		} );

		it( 'registers request and response interceptors exactly once', () => {
			expect( capturedRequestInterceptorCount ).toBe( 1 );
			expect( capturedResponseInterceptorCount ).toBe( 1 );
		} );

		it( 'returns the same singleton instance on every call', () => {
			expect( httpService() ).toBe( httpService() );
		} );
	} );

	describe( 'success interceptor', () => {
		it( 'passes successful responses through unchanged', () => {
			const response = {
				status: 200,
				statusText: 'OK',
				data: 'ok',
				headers: {},
				config: {} as InternalAxiosRequestConfig,
			};
			expect( onSuccess( response ) ).toBe( response );
		} );
	} );

	describe( 'retry interceptor', () => {
		beforeEach( () => {
			jest.useFakeTimers();
			// Pin Math.random so jitter is deterministic (jitter = random * 100ms → 0)
			jest.spyOn( Math, 'random' ).mockReturnValue( 0 );
			mockAxiosInstance.mockReset();
		} );

		afterEach( () => {
			jest.useRealTimers();
		} );

		it( 'does not retry 4xx errors', async () => {
			const error = makeError( 400 );
			await expect( onError( error ) ).rejects.toBe( error );
			expect( mockAxiosInstance ).not.toHaveBeenCalled();
		} );

		it( 'does not retry when request config is absent', async () => {
			const error = { response: { status: 500 } }; // no config property
			await expect( onError( error ) ).rejects.toBe( error );
			expect( mockAxiosInstance ).not.toHaveBeenCalled();
		} );

		it( 'does not retry POST requests', async () => {
			const error = makeError( 500, undefined, 'post' );
			await expect( onError( error ) ).rejects.toBe( error );
			expect( mockAxiosInstance ).not.toHaveBeenCalled();
		} );

		it( 'does not retry PATCH requests', async () => {
			const error = makeError( 500, undefined, 'patch' );
			await expect( onError( error ) ).rejects.toBe( error );
			expect( mockAxiosInstance ).not.toHaveBeenCalled();
		} );

		it( 'retries GET requests on 5xx error', async () => {
			const error = makeError( 500, undefined, 'get' );
			mockAxiosInstance.mockResolvedValueOnce( { data: 'recovered' } );

			const promise = onError( error );
			await jest.runAllTimersAsync();

			await expect( promise ).resolves.toBeDefined();
			expect( mockAxiosInstance ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'retries on 5xx error and resolves when retry succeeds', async () => {
			const error = makeError( 500 );
			mockAxiosInstance.mockResolvedValueOnce( { data: 'recovered' } );

			const promise = onError( error );
			await jest.runAllTimersAsync();

			await expect( promise ).resolves.toEqual( { data: 'recovered' } );
			expect( mockAxiosInstance ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'retries 429 Too Many Requests errors', async () => {
			const error = makeError( 429 );
			mockAxiosInstance.mockResolvedValueOnce( { data: 'ok' } );

			const promise = onError( error );
			await jest.runAllTimersAsync();

			await expect( promise ).resolves.toBeDefined();
			expect( mockAxiosInstance ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'retries on network errors (no HTTP response)', async () => {
			const error = makeError(); // no status → no response
			mockAxiosInstance.mockResolvedValueOnce( { data: 'recovered' } );

			const promise = onError( error );
			await jest.runAllTimersAsync();

			await expect( promise ).resolves.toBeDefined();
			expect( mockAxiosInstance ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'rejects after exhausting all 3 retries', async () => {
			const error = makeError( 503, 3 ); // __retryCount already at MAX_RETRIES
			await expect( onError( error ) ).rejects.toBe( error );
			expect( mockAxiosInstance ).not.toHaveBeenCalled();
		} );

		it( 'does not mutate the original config and passes incremented count to retry', async () => {
			const error = makeError( 500 ); // starts with no __retryCount
			mockAxiosInstance.mockResolvedValueOnce( {} );

			const promise = onError( error );
			await jest.runAllTimersAsync();
			await promise;

			// Original config must not be mutated
			expect( ( error.config as RetryConfig ).__retryCount ).toBeUndefined();

			// Retry received a new config with __retryCount = 1
			const retryCallConfig = mockAxiosInstance.mock.calls[ 0 ][ 0 ];
			expect( ( retryCallConfig as RetryConfig ).__retryCount ).toBe( 1 );
		} );

		it( 'doubles the timeout on the first retry (retryCount = 0)', async () => {
			const error = makeError( 500, undefined, undefined, 10000 );
			mockAxiosInstance.mockResolvedValueOnce( {} );

			const promise = onError( error );
			await jest.runAllTimersAsync();
			await promise;

			const retryConfig = mockAxiosInstance.mock.calls[ 0 ][ 0 ] as RetryConfig;
			expect( retryConfig.timeout ).toBe( 20000 ); // 10000 * (0 + 2)
		} );

		it( 'scales timeout from the original base, not from the already-extended value', async () => {
			// Simulate second retry: __retryCount = 1, __baseTimeout already stored as 10000
			const error = makeError( 500, 1 );
			( error.config as RetryConfig ).__baseTimeout = 10000;
			( error.config as RetryConfig ).timeout = 20000; // already extended from retry 1
			mockAxiosInstance.mockResolvedValueOnce( {} );

			const promise = onError( error );
			await jest.runAllTimersAsync();
			await promise;

			const retryConfig = mockAxiosInstance.mock.calls[ 0 ][ 0 ] as RetryConfig;
			// Must scale from __baseTimeout (10000), not from the current timeout (20000)
			expect( retryConfig.timeout ).toBe( 30000 ); // 10000 * (1 + 2)
		} );

		it( 'stores __baseTimeout on the retry config so the base is preserved', async () => {
			const error = makeError( 500, undefined, undefined, 10000 );
			mockAxiosInstance.mockResolvedValueOnce( {} );

			const promise = onError( error );
			await jest.runAllTimersAsync();
			await promise;

			const retryConfig = mockAxiosInstance.mock.calls[ 0 ][ 0 ] as RetryConfig;
			expect( retryConfig.__baseTimeout ).toBe( 10000 );
		} );

		it( 'uses 1000ms delay for the first retry (retryCount = 0)', async () => {
			const error = makeError( 500 );
			mockAxiosInstance.mockResolvedValueOnce( {} );

			onError( error );

			await jest.advanceTimersByTimeAsync( 999 );
			expect( mockAxiosInstance ).not.toHaveBeenCalled();

			await jest.advanceTimersByTimeAsync( 1 );
			expect( mockAxiosInstance ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'uses 2000ms delay for the second retry (retryCount = 1)', async () => {
			const error = makeError( 500, 1 );
			mockAxiosInstance.mockResolvedValueOnce( {} );

			onError( error );

			await jest.advanceTimersByTimeAsync( 1999 );
			expect( mockAxiosInstance ).not.toHaveBeenCalled();

			await jest.advanceTimersByTimeAsync( 1 );
			expect( mockAxiosInstance ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'uses 4000ms delay for the third retry (retryCount = 2)', async () => {
			const error = makeError( 500, 2 );
			mockAxiosInstance.mockResolvedValueOnce( {} );

			onError( error );

			await jest.advanceTimersByTimeAsync( 3999 );
			expect( mockAxiosInstance ).not.toHaveBeenCalled();

			await jest.advanceTimersByTimeAsync( 1 );
			expect( mockAxiosInstance ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'caching', () => {
		const createMockConfig = (
			overrides: Partial< InternalAxiosRequestConfig > = {}
		): InternalAxiosRequestConfig =>
			( {
				baseURL: 'http://test.com',
				url: '/api/data',
				method: 'get',
				headers: {},
				...overrides,
			} ) as InternalAxiosRequestConfig;

		const createMockResponse = (
			config: InternalAxiosRequestConfig,
			data: unknown = { result: 'ok' }
		): AxiosResponse => ( {
			data,
			status: 200,
			statusText: 'OK',
			headers: {},
			config,
		} );

		beforeEach( () => {
			jest.useFakeTimers();
		} );

		afterEach( () => {
			jest.useRealTimers();
		} );

		it( 'does not cache URLs that are not registered', () => {
			// Arrange
			const config = createMockConfig( { url: '/api/not-registered' } );
			const response = createMockResponse( config );

			// Act
			onSuccess( response );
			const resultConfig = onRequestIntercept( createMockConfig( { url: '/api/not-registered' } ) );

			// Assert
			expect( resultConfig.signal ).toBeUndefined();
		} );

		it( 'caches GET responses for registered URLs', () => {
			// Arrange
			registerUrlForCache( '/api/cached-endpoint' );
			const config = createMockConfig( { url: '/api/cached-endpoint' } );
			const response = createMockResponse( config, { cached: 'data' } );

			// Act
			onSuccess( response );
			const resultConfig = onRequestIntercept(
				createMockConfig( { url: '/api/cached-endpoint' } )
			) as InternalAxiosRequestConfig & { __cachedResponse?: AxiosResponse };

			// Assert
			expect( resultConfig.signal?.aborted ).toBe( true );
			expect( resultConfig.__cachedResponse?.data ).toEqual( { cached: 'data' } );
		} );

		it( 'does not cache POST requests even for registered URLs', () => {
			// Arrange
			registerUrlForCache( '/api/post-endpoint' );
			const config = createMockConfig( { url: '/api/post-endpoint', method: 'post' } );
			const response = createMockResponse( config );

			// Act
			onSuccess( response );
			const resultConfig = onRequestIntercept(
				createMockConfig( { url: '/api/post-endpoint', method: 'post' } )
			);

			// Assert
			expect( resultConfig.signal ).toBeUndefined();
		} );

		it( 'expires cache after 20 seconds', () => {
			// Arrange
			registerUrlForCache( '/api/expiring' );
			const config = createMockConfig( { url: '/api/expiring' } );
			const response = createMockResponse( config, { fresh: 'data' } );

			// Act
			onSuccess( response );

			jest.advanceTimersByTime( 20001 );

			const resultConfig = onRequestIntercept( createMockConfig( { url: '/api/expiring' } ) );

			// Assert
			expect( resultConfig.signal ).toBeUndefined();
		} );

		it( 'returns cached response within TTL', () => {
			// Arrange
			registerUrlForCache( '/api/within-ttl' );
			const config = createMockConfig( { url: '/api/within-ttl' } );
			const response = createMockResponse( config, { still: 'valid' } );

			// Act
			onSuccess( response );

			jest.advanceTimersByTime( 19000 );

			const resultConfig = onRequestIntercept(
				createMockConfig( { url: '/api/within-ttl' } )
			) as InternalAxiosRequestConfig & { __cachedResponse?: AxiosResponse };

			// Assert
			expect( resultConfig.signal?.aborted ).toBe( true );
			expect( resultConfig.__cachedResponse?.data ).toEqual( { still: 'valid' } );
		} );

		it( 'caches URLs with partial match', () => {
			// Arrange
			registerUrlForCache( '/templates' );
			const config = createMockConfig( { url: '/api/templates/123' } );
			const response = createMockResponse( config, { template: 'data' } );

			// Act
			onSuccess( response );
			const resultConfig = onRequestIntercept(
				createMockConfig( { url: '/api/templates/123' } )
			) as InternalAxiosRequestConfig & { __cachedResponse?: AxiosResponse };

			// Assert
			expect( resultConfig.__cachedResponse?.data ).toEqual( { template: 'data' } );
		} );

		it( 'differentiates cache entries by query params', () => {
			// Arrange
			registerUrlForCache( '/api/with-params' );
			const config1 = createMockConfig( {
				url: '/api/with-params',
				params: { id: 1 },
			} );
			const config2 = createMockConfig( {
				url: '/api/with-params',
				params: { id: 2 },
			} );
			const response1 = createMockResponse( config1, { id: 1 } );
			const response2 = createMockResponse( config2, { id: 2 } );

			// Act
			onSuccess( response1 );
			onSuccess( response2 );

			const result1 = onRequestIntercept(
				createMockConfig( { url: '/api/with-params', params: { id: 1 } } )
			) as InternalAxiosRequestConfig & { __cachedResponse?: AxiosResponse };
			const result2 = onRequestIntercept(
				createMockConfig( { url: '/api/with-params', params: { id: 2 } } )
			) as InternalAxiosRequestConfig & { __cachedResponse?: AxiosResponse };

			// Assert
			expect( result1.__cachedResponse?.data ).toEqual( { id: 1 } );
			expect( result2.__cachedResponse?.data ).toEqual( { id: 2 } );
		} );

		it( 'returns cached response from error handler when request was aborted', async () => {
			// Arrange
			registerUrlForCache( '/api/error-handler' );
			const config = createMockConfig( { url: '/api/error-handler' } );
			const response = createMockResponse( config, { from: 'cache' } );
			onSuccess( response );

			const abortedConfig = onRequestIntercept( createMockConfig( { url: '/api/error-handler' } ) );
			const error = { config: abortedConfig };

			// Act
			const result = await onError( error );

			// Assert
			expect( ( result as AxiosResponse ).data ).toEqual( { from: 'cache' } );
		} );

		it( 'uses custom TTL when provided', () => {
			// Arrange
			registerUrlForCache( '/api/custom-ttl', 5000 );
			const config = createMockConfig( { url: '/api/custom-ttl' } );
			const response = createMockResponse( config, { custom: 'ttl' } );

			// Act
			onSuccess( response );

			jest.advanceTimersByTime( 4999 );
			const resultBeforeExpiry = onRequestIntercept(
				createMockConfig( { url: '/api/custom-ttl' } )
			) as InternalAxiosRequestConfig & { __cachedResponse?: AxiosResponse };

			jest.advanceTimersByTime( 2 );
			const resultAfterExpiry = onRequestIntercept( createMockConfig( { url: '/api/custom-ttl' } ) );

			// Assert
			expect( resultBeforeExpiry.__cachedResponse?.data ).toEqual( { custom: 'ttl' } );
			expect( resultAfterExpiry.signal ).toBeUndefined();
		} );
	} );
} );
