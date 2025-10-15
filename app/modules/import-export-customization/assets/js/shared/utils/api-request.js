import { ImportExportError } from '../error/import-export-error';

/**
 * Shared API request utility for import-export-customization module
 * Follows the same pattern as React hooks but for non-React contexts
 * @param {Object}               root0        - Request configuration
 * @param {Object|FormData|null} root0.data   - Request payload data
 * @param {string}               root0.path   - API endpoint path
 * @param {string}               root0.method - HTTP method
 */
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
