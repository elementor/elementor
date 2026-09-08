import apiFetch from '@wordpress/api-fetch';

type PluginResponse = {
	plugin: string;
	status: 'active' | 'inactive';
	name: string;
};

type PluginErrorResponse = {
	code: string;
	message: string;
};

export type InstallPluginResult = { success: true } | { success: false; error: string; code?: string };

const isPluginErrorResponse = ( response: unknown ): response is PluginErrorResponse => {
	return typeof response === 'object' && response !== null && 'code' in response && 'message' in response;
};

const activatePlugin = ( pluginFile: string ): Promise< PluginResponse > => {
	return apiFetch< PluginResponse >( {
		path: `/wp/v2/plugins/${ pluginFile }`,
		method: 'POST',
		data: { status: 'active' },
	} );
};

const installPlugin = async ( slug: string, pluginFile: string ): Promise< PluginResponse > => {
	try {
		return await apiFetch< PluginResponse >( {
			path: '/wp/v2/plugins',
			method: 'POST',
			data: { slug, status: 'active' },
		} );
	} catch ( error: unknown ) {
		if ( isPluginErrorResponse( error ) && 'folder_exists' === error.code ) {
			return activatePlugin( pluginFile );
		}

		throw error;
	}
};

export const installAndActivatePlugin = async ( slug: string, pluginFile: string ): Promise< InstallPluginResult > => {
	try {
		await installPlugin( slug, pluginFile );

		return { success: true };
	} catch ( error: unknown ) {
		if ( isPluginErrorResponse( error ) ) {
			return { success: false, error: error.message, code: error.code };
		}

		return { success: false, error: 'Unknown error occurred' };
	}
};
