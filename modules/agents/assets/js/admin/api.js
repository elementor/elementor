import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import { getToggleSettingsPatch } from './scanner/scanner-check-settings';
import { toScanResult } from './scanner/scanner-report-adapter';

const AGENT_READY_SETTINGS_PATH = '/elementor/v1/settings/elementor_agent_ready_settings';
const SCANNER_SCAN_PATH = '/elementor/v1/agents-ready/scan';
const HTTP_NOT_FOUND = 404;
const ANGIE_PLUGIN_SLUG = 'angie';
const PLUGIN_FOLDER_EXISTS = 'folder_exists';

const toScanError = ( reason ) => Object.assign( new Error( reason?.message ?? '' ), {
	status: reason?.data?.status ?? null,
	reason: reason?.data?.meta?.reason ?? null,
	retryAt: reason?.data?.meta?.retryAt ?? null,
} );

export const runSiteScan = async () => {
	try {
		const response = await apiFetch( { path: SCANNER_SCAN_PATH, method: 'POST' } );

		return toScanResult( response?.data?.report, response?.data?.retryAt );
	} catch ( reason ) {
		throw toScanError( reason );
	}
};

const isPluginError = ( error ) => Boolean( error && 'string' === typeof error.code && 'string' === typeof error.message );

const activateAngiePlugin = ( pluginPath ) => apiFetch( {
	path: `/wp/v2/plugins/${ pluginPath }`,
	method: 'POST',
	data: { status: 'active' },
} );

export const installAngiePlugin = async () => {
	try {
		await apiFetch( {
			path: '/wp/v2/plugins',
			method: 'POST',
			data: {
				slug: ANGIE_PLUGIN_SLUG,
				status: 'active',
			},
		} );

		return { success: true };
	} catch ( error ) {
		if ( isPluginError( error ) && PLUGIN_FOLDER_EXISTS === error.code ) {
			try {
				await activateAngiePlugin( `${ ANGIE_PLUGIN_SLUG }/${ ANGIE_PLUGIN_SLUG }` );

				return { success: true };
			} catch ( activateError ) {
				return {
					success: false,
					error: isPluginError( activateError ) ? activateError.message : '',
				};
			}
		}

		return {
			success: false,
			error: isPluginError( error ) ? error.message : '',
		};
	}
};

export const activateAgentsReady = () => {
	return elementorCommon.ajax.addRequest( 'agents_ready_activate' );
};

// The server merges each module key onto the stored object, so callers send only the modules they changed.
export const saveAgentReadySettings = ( settings ) => {
	return apiFetch( {
		path: AGENT_READY_SETTINGS_PATH,
		method: 'PUT',
		data: { value: settings },
	} );
};

const UNMAPPED_TOGGLE_FIX_ERROR = __( 'This fix cannot be applied from the scanner yet.', 'elementor' );

const saveToggleFix = ( checkId, isEnabled ) => {
	const patch = getToggleSettingsPatch( checkId, isEnabled );

	if ( ! patch ) {
		return Promise.reject( new Error( UNMAPPED_TOGGLE_FIX_ERROR ) );
	}

	return saveAgentReadySettings( patch );
};

export const applyCheckFix = ( checkId, payload = {} ) => {
	if ( Object.prototype.hasOwnProperty.call( payload, 'value' ) ) {
		return Promise.resolve( { checkId, payload } );
	}

	return saveToggleFix( checkId, Boolean( payload.enabled ) );
};

export const undoCheckFix = ( checkId ) => {
	const patch = getToggleSettingsPatch( checkId, false );

	if ( ! patch ) {
		return Promise.resolve( { checkId } );
	}

	return saveAgentReadySettings( patch );
};

// The file is served with a public max-age, so skip both the browser cache and any shared cache to show the latest save.
export const fetchLlmsFile = async ( url ) => {
	const fileUrl = new URL( url );
	fileUrl.searchParams.set( 'ver', Date.now().toString() );

	const response = await fetch( fileUrl.toString(), { cache: 'no-store' } );

	if ( HTTP_NOT_FOUND === response.status ) {
		return '';
	}

	if ( ! response.ok ) {
		throw new Error( response.statusText );
	}

	return response.text();
};

export const fetchMarkdownPreview = ( postId ) => {
	return new Promise( ( resolve, reject ) => {
		elementorCommon.ajax.addRequest( 'agents_ready_preview_markdown', {
			data: { postId },
			success: ( response ) => resolve( response?.content ?? '' ),
			error: reject,
		} );
	} );
};

export const searchMarkdownItems = ( term ) => {
	return new Promise( ( resolve, reject ) => {
		elementorCommon.ajax.addRequest( 'agents_ready_search_markdown', {
			data: { term },
			success: ( response ) => resolve( response?.items ?? [] ),
			error: reject,
		} );
	} );
};

const requestLlmsAction = ( action, data = {} ) => {
	return new Promise( ( resolve, reject ) => {
		elementorCommon.ajax.addRequest( action, {
			data,
			success: resolve,
			error: reject,
		} );
	} );
};

export const saveLlmsContent = ( content ) => requestLlmsAction( 'agents_ready_save_llms_content', { content } );

export const revertLlmsContent = () => requestLlmsAction( 'agents_ready_revert_llms_content' );

export const takeOverLlmsFile = () => requestLlmsAction( 'agents_ready_takeover_llms_file' );
