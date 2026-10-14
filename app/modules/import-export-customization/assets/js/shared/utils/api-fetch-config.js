import apiFetch from '@wordpress/api-fetch';
import { ImportExportError } from '../error/import-export-error';

let isApiConfigured = false;

export function configureApiFetch() {
	if ( isApiConfigured ) {
		return;
	}

	const config = window.elementorAppConfig?.[ 'import-export-customization' ];

	if ( ! config ) {
		throw new ImportExportError( 'Configuration not found. Please refresh the page.', 'config_missing' );
	}

	if ( config.restNonce ) {
		apiFetch.use( apiFetch.createNonceMiddleware( config.restNonce ) );
	}

	if ( config.restUrl ) {
		apiFetch.use( apiFetch.createRootURLMiddleware( config.restUrl ) );
	}

	isApiConfigured = true;
}

export function resetApiFetchConfig() {
	isApiConfigured = false;
}
