import apiFetch from '@wordpress/api-fetch';

const AGENT_READY_SETTINGS_PATH = '/elementor/v1/settings/elementor_agent_ready_settings';
const HTTP_NOT_FOUND = 404;

export const activateAgentsReady = () => {
	return elementorCommon.ajax.addRequest( 'agents_ready_opt_in' );
};

// The server merges each module key onto the stored object, so callers send only the modules they changed.
export const saveAgentReadySettings = ( settings ) => {
	return apiFetch( {
		path: AGENT_READY_SETTINGS_PATH,
		method: 'PUT',
		data: { value: settings },
	} );
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

export const saveLlmsContent = ( content ) => {
	return new Promise( ( resolve, reject ) => {
		elementorCommon.ajax.addRequest( 'agents_ready_save_llms_content', {
			data: { content },
			success: resolve,
			error: reject,
		} );
	} );
};
