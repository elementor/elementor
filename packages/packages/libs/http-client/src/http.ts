import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { env } from './env';

export type HttpResponse< TData, TMeta = Record< string, unknown > > = {
	data: TData;
	meta: TMeta;
};

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const CACHE_TTL_MS = 20_000;

type CacheEntry = {
	response: AxiosResponse;
	timestamp: number;
};

const cache = new Map< string, CacheEntry >();
const cacheableUrls = new Map< string, number >();

export function registerUrlForCache( partialUrl: string, ttlMs: number = CACHE_TTL_MS ): void {
	cacheableUrls.set( partialUrl, ttlMs );
}

function getUrlCacheTtl( url: string ): number | null {
	for ( const [ pattern, ttl ] of cacheableUrls ) {
		if ( url.includes( pattern ) ) {
			return ttl;
		}
	}

	return null;
}

function getCacheKey( config: InternalAxiosRequestConfig ): string {
	const url = config.url ?? '';
	const params = config.params ? JSON.stringify( config.params ) : '';
	return `${ config.baseURL ?? '' }${ url }${ params }`;
}

function getCachedResponse( config: InternalAxiosRequestConfig ): AxiosResponse | null {
	if ( config.method?.toLowerCase() !== 'get' ) {
		return null;
	}

	const url = `${ config.baseURL ?? '' }${ config.url ?? '' }`;
	const ttl = getUrlCacheTtl( url );
	if ( ttl === null ) {
		return null;
	}

	const key = getCacheKey( config );
	const entry = cache.get( key );

	if ( ! entry ) {
		return null;
	}

	if ( Date.now() - entry.timestamp > ttl ) {
		cache.delete( key );
		return null;
	}

	return entry.response;
}

function setCachedResponse( config: InternalAxiosRequestConfig | undefined, response: AxiosResponse ): void {
	if ( ! config || config.method?.toLowerCase() !== 'get' ) {
		return;
	}

	const url = `${ config.baseURL ?? '' }${ config.url ?? '' }`;
	if ( getUrlCacheTtl( url ) === null ) {
		return;
	}

	const key = getCacheKey( config );
	cache.set( key, { response, timestamp: Date.now() } );
}

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

		instance.interceptors.request.use( ( config ) => {
			const cachedResponse = getCachedResponse( config );
			if ( cachedResponse ) {
				const controller = new AbortController();
				controller.abort();
				return {
					...config,
					signal: controller.signal,
					__cachedResponse: cachedResponse,
				} as typeof config;
			}
			return config;
		} );

		instance.interceptors.response.use(
			( response ) => {
				setCachedResponse( response.config, response );
				return response;
			},
			async ( error: AxiosError ) => {
				const config = error.config as typeof error.config & {
					__cachedResponse?: AxiosResponse;
					__retryCount?: number;
					__baseTimeout?: number;
				};

				if ( config?.__cachedResponse ) {
					return config.__cachedResponse;
				}

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
