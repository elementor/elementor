import { isNonceError, refreshNonce } from './nonce-refresh';
import { getWpApiSettings } from './utils';

type WpApiResponse = unknown;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

type CallWpApiOptions = {
	binaryData?: ArrayBufferLike;
	customHeaders?: Record< string, string >;
};

type CallWpApiResult< T > = {
	data: T;
	totalItems?: number;
	totalPages?: number;
};

export async function callWpApi< T = WpApiResponse >(
	endpoint: string,
	method: HttpMethod,
	data?: Record< string, unknown >,
	options?: CallWpApiOptions
): Promise< CallWpApiResult< T > > {
	return executeWpApiCall< T >( endpoint, method, data, options, true );
}

async function executeWpApiCall< T = WpApiResponse >(
	endpoint: string,
	method: HttpMethod,
	data?: Record< string, unknown >,
	options?: CallWpApiOptions,
	allowNonceRetry = false
): Promise< CallWpApiResult< T > > {
	const wpApiSettings = getWpApiSettings();
	if ( ! wpApiSettings?.nonce || ! wpApiSettings.root ) {
		throw new Error( 'wpApiSettings not available' );
	}

	const baseUrl = wpApiSettings.root;
	const urlObject = new URL( baseUrl );
	const endpointUrl = new URL( endpoint, baseUrl );

	urlObject.searchParams.set( 'rest_route', endpointUrl.pathname );

	for ( const [ key, value ] of endpointUrl.searchParams.entries() ) {
		urlObject.searchParams.append( key, value );
	}

	const url = urlObject.toString();

	const headers: Record< string, string > = {
		'X-WP-Nonce': wpApiSettings.nonce,
		...( options?.customHeaders || {} ),
	};

	if ( ! options?.binaryData && ! options?.customHeaders?.[ 'Content-Type' ] ) {
		headers[ 'Content-Type' ] = 'application/json';
	}

	const requestOptions: RequestInit = {
		method,
		headers,
		credentials: 'same-origin',
	};

	if ( options?.binaryData ) {
		requestOptions.body = options.binaryData as ArrayBuffer;
	} else if ( data && ( method === 'POST' || method === 'PUT' || method === 'PATCH' ) ) {
		requestOptions.body = JSON.stringify( data );
	}

	const response = await fetch( url, requestOptions );

	if ( ! response.ok ) {
		const responseText = await response.text();

		if ( allowNonceRetry && isNonceError( response.status, responseText ) ) {
			await refreshNonce();
			return executeWpApiCall< T >( endpoint, method, data, options, false );
		}

		throw new Error( `HTTP error ${ response.status }: ${ responseText }` );
	}

	const responseText = await response.text();
	const json = extractJSONFromResponse( responseText );

	if ( json === null ) {
		throw new Error( `Invalid response: no JSON found in: ${ responseText.substring( 0, 200 ) }` );
	}

	const jsonObj = json as { success?: boolean };
	if ( jsonObj?.success !== undefined && ! jsonObj.success ) {
		throw new Error( `API errors: ${ JSON.stringify( json ) }` );
	}

	const totalItemsHeader = response.headers.get( 'X-WP-Total' );
	const totalPagesHeader = response.headers.get( 'X-WP-TotalPages' );
	const totalItems: number | undefined = totalItemsHeader ? parseInt( totalItemsHeader, 10 ) : undefined;
	const totalPages: number | undefined = totalPagesHeader ? parseInt( totalPagesHeader, 10 ) : undefined;

	return {
		data: json as T,
		totalItems,
		totalPages,
	};
}

export function extractJSONFromResponse( responseText: string ): unknown {
	const objectStart = responseText.indexOf( '{' );
	const arrayStart = responseText.indexOf( '[' );

	let startIndex = -1;
	let isArray = false;

	if ( objectStart === -1 && arrayStart === -1 ) {
		return null;
	}

	if ( objectStart === -1 ) {
		startIndex = arrayStart;
		isArray = true;
	} else if ( arrayStart === -1 ) {
		startIndex = objectStart;
		isArray = false;
	} else if ( arrayStart < objectStart ) {
		startIndex = arrayStart;
		isArray = true;
	} else {
		startIndex = objectStart;
		isArray = false;
	}

	let delimiterCount = 0;
	let endIndex = -1;
	const openChar = isArray ? '[' : '{';
	const closeChar = isArray ? ']' : '}';

	for ( let i = startIndex; i < responseText.length; i++ ) {
		if ( responseText[ i ] === openChar ) {
			delimiterCount++;
		} else if ( responseText[ i ] === closeChar ) {
			delimiterCount--;
			if ( delimiterCount === 0 ) {
				endIndex = i;
				break;
			}
		}
	}

	if ( endIndex === -1 ) {
		return null;
	}

	const jsonString = responseText.substring( startIndex, endIndex + 1 );

	try {
		return JSON.parse( jsonString );
	} catch {
		return null;
	}
}
