import { ImportExportError } from '../error/import-export-error';

const HTTP_STATUS = {
	REQUEST_TIMEOUT: 408,
};

export async function apiRequest( { data = null, path, method = 'POST' } ) {
	const baseUrl =
		elementorAppConfig[ 'import-export-customization' ].restApiBaseUrl;
	const requestUrl = `${ baseUrl }/${ path }`;

	const requestOptions = {
		method,
		headers: {
			'X-WP-Nonce': window.wpApiSettings?.nonce || '',
		},
	};

	if ( data && ( 'POST' === method || 'PUT' === method || 'PATCH' === method ) ) {
		if ( data instanceof FormData ) {
			requestOptions.body = data;
		} else {
			requestOptions.headers[ 'Content-Type' ] = 'application/json';
			requestOptions.body = JSON.stringify( data );
		}
	}

	const response = await fetch( requestUrl, requestOptions );
	let result;
	try {
		result = await response.json();
	} catch ( err ) {
		const errorMessage = `Invalid JSON response: ${ err?.message || String(err) }`;
		const errorCode = HTTP_STATUS.REQUEST_TIMEOUT === response?.status ? 'timeout' : response?.status;
		throw new ImportExportError( errorMessage, errorCode );
	}

	if ( ! response.ok ) {
		const errorMessage =
			result?.data?.message ||
			`HTTP error! with the following code: ${ result?.data?.code }`;
		const errorCode = HTTP_STATUS.REQUEST_TIMEOUT === response?.status ? 'timeout' : result?.data?.code;
		throw new ImportExportError( errorMessage, errorCode );
	}

	return result;
}
