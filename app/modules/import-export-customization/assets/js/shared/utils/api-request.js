import { ImportExportError } from '../error/import-export-error';

const HTTP_STATUS = {
	REQUEST_TIMEOUT: 408,
};

export async function apiRequest( { data = null, path, method = 'POST' } ) {
	const baseUrl =
		elementorAppConfig[ 'import-export-customization' ].restApiBaseUrl;
	const requestUrl = `${ baseUrl }/${ path }`;

	const requestOptions = getRequestOptions( method, data );

	const response = await fetch( requestUrl, requestOptions );

	const result = await parseResponseJson( response );

	if ( ! response.ok ) {
		throwHttpError( response, result );
	}

	return result;
}

function getRequestOptions( method, data ) {
	const requestOptions = {
		method,
		headers: {
			'X-WP-Nonce': window.wpApiSettings?.nonce || '',
		},
	};

	const shouldIncludeBody = data && ( 'POST' === method || 'PUT' === method || 'PATCH' === method );

	if ( ! shouldIncludeBody ) {
		return requestOptions;
	}

	if ( data instanceof FormData ) {
		requestOptions.body = data;
		return requestOptions;
	}

	requestOptions.headers[ 'Content-Type' ] = 'application/json';
	requestOptions.body = JSON.stringify( data );
	return requestOptions;
}

async function parseResponseJson( response ) {
	try {
		return await response.json();
	} catch ( err ) {
		const errorMessage = `Invalid JSON response: ${ err?.message || String( err ) }`;
		const errorCode = HTTP_STATUS.REQUEST_TIMEOUT === response?.status ? 'timeout' : response?.status;
		throw new ImportExportError( errorMessage, errorCode );
	}
}

function throwHttpError( response, result ) {
	const errorMessage =
		result?.data?.message ||
		`HTTP error! with the following code: ${ result?.data?.code }`;
	const errorCode = HTTP_STATUS.REQUEST_TIMEOUT === response?.status ? 'timeout' : result?.data?.code;
	throw new ImportExportError( errorMessage, errorCode );
}
