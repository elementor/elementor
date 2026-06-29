import apiFetch from '@wordpress/api-fetch';
import { ImportExportError } from '../error/import-export-error';
import { configureApiFetch } from './api-fetch-config';

const HTTP_STATUS = {
	REQUEST_TIMEOUT: 408,
};

const HTTP_METHODS = {
	CREATABLE: 'POST',
};

export async function apiRequest( { data = null, path, method = HTTP_METHODS.CREATABLE } ) {
	configureApiFetch();

	try {
		const requestOptions = {
			path: `/elementor/v1/import-export-customization/${ path }`,
			method,
		};

		if ( data && HTTP_METHODS.CREATABLE === method ) {
			requestOptions.data = data;
		}

		return await apiFetch( requestOptions );
	} catch ( error ) {
		handleApiFetchError( error );
	}
}

function handleApiFetchError( error ) {
	const errorMessage = error?.message || 'An unknown error occurred';
	let errorCode = 'general';

	if ( error?.code ) {
		errorCode = error.code;
	} else if ( error?.status ) {
		errorCode = HTTP_STATUS.REQUEST_TIMEOUT === error.status ? 'timeout' : error.status;
	}

	throw new ImportExportError( errorMessage, errorCode );
}
