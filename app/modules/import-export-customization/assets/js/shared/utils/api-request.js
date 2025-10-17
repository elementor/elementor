import { ImportExportError } from '../error/import-export-error';

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
	const result = await response.json();

	if ( ! response.ok ) {
		const errorMessage =
			result?.data?.message ||
			`HTTP error! with the following code: ${ result?.data?.code }`;
		const errorCode = 408 === response?.status ? 'timeout' : result?.data?.code;
		throw new ImportExportError( errorMessage, errorCode );
	}

	return result;
}
