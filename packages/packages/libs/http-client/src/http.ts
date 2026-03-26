import axios, { type AxiosError, type AxiosInstance } from 'axios';

import { env } from './env';

export type HttpResponse< TData, TMeta = Record< string, unknown > > = {
	data: TData;
	meta: TMeta;
};

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

// Only idempotent / safe methods are retried. POST and PATCH are excluded because
// a 500 may arrive after the server partially completed the operation, and retrying
// could produce duplicates (e.g. create, lock, archive endpoints).
const RETRYABLE_METHODS = new Set( [ 'get', 'head', 'options', 'put', 'delete' ] );

let instance: AxiosInstance;

export const httpService = () => {
	if ( ! instance ) {
		instance = axios.create( {
			baseURL: env.base_url,
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
				...env.headers,
			},
		} );

		instance.interceptors.response.use(
			( response ) => response,
			async ( error: AxiosError ) => {
				const config = error.config as typeof error.config & {
					__retryCount?: number;
					__baseTimeout?: number;
				};

				if ( ! config || ! shouldRetry( error ) ) {
					return Promise.reject( error );
				}

				const retryCount = config.__retryCount ?? 0;

				if ( retryCount >= MAX_RETRIES ) {
					return Promise.reject( error );
				}

				const baseDelay = BASE_DELAY_MS * Math.pow( 2, retryCount );
				const jitter = Math.random() * BASE_DELAY_MS * 0.1;
				await sleep( baseDelay + jitter );

				const baseTimeout = config.__baseTimeout ?? config.timeout ?? 10000;

				return instance( {
					...config,
					__retryCount: retryCount + 1,
					__baseTimeout: baseTimeout,
					timeout: baseTimeout * ( retryCount + 2 ),
				} as typeof config );
			}
		);
	}

	return instance;
};

function shouldRetry( error: AxiosError ): boolean {
	const method = error.config?.method?.toLowerCase();
	if ( method && ! RETRYABLE_METHODS.has( method ) ) {
		return false;
	}

	if ( ! error.response ) {
		return true;
	}
	// 429 Too Many Requests: transient rate-limiting, backoff helps
	if ( error.response.status === 429 ) {
		return true;
	}
	return error.response.status >= 500;
}

function sleep( ms: number ): Promise< void > {
	return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}
