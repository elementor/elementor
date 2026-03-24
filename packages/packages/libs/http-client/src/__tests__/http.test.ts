import axios from 'axios';

import { httpService } from '../http';

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
	let onSuccess: ( response: unknown ) => unknown;
	let onError: ( error: unknown ) => Promise< unknown >;

	// Captured before any afterEach(() => jest.clearAllMocks()) can wipe them
	let capturedCreateConfig: unknown;
	let capturedInterceptorRegistrationCount: number;

	beforeAll( () => {
		httpService();

		const useMock = mockAxiosInstance.interceptors.response.use as jest.Mock;
		capturedCreateConfig = ( axios.create as jest.Mock ).mock.calls[ 0 ]?.[ 0 ];
		capturedInterceptorRegistrationCount = useMock.mock.calls.length;
		[ onSuccess, onError ] = useMock.mock.calls[ 0 ];
	} );

	describe( 'initialization', () => {
		it( 'creates the axios instance with the correct base config', () => {
			expect( capturedCreateConfig ).toEqual( {
				baseURL: 'http://test.com',
				timeout: 10000,
				headers: { 'Content-Type': 'application/json' },
			} );
		} );

		it( 'registers the response interceptor exactly once', () => {
			expect( capturedInterceptorRegistrationCount ).toBe( 1 );
		} );

		it( 'returns the same singleton instance on every call', () => {
			expect( httpService() ).toBe( httpService() );
		} );
	} );

	describe( 'success interceptor', () => {
		it( 'passes successful responses through unchanged', () => {
			const response = { status: 200, data: 'ok' };
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
} );
