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

export type InstallAngieResult = { success: true } | { success: false; error: string; code?: string };

const ANGIE_SLUG = 'angie';

const isPluginErrorResponse = ( response: unknown ): response is PluginErrorResponse => {
	return typeof response === 'object' && response !== null && 'code' in response && 'message' in response;
};

const activatePlugin = async ( pluginPath: string ): Promise< PluginResponse > => {
	return apiFetch< PluginResponse >( {
		path: `/wp/v2/plugins/${ pluginPath }`,
		method: 'POST',
		data: { status: 'active' },
	} );
};

const installPlugin = async (): Promise< PluginResponse > => {
	try {
		return await apiFetch< PluginResponse >( {
			path: '/wp/v2/plugins',
			method: 'POST',
			data: {
				slug: ANGIE_SLUG,
				status: 'active',
			},
		} );
	} catch ( error: unknown ) {
		if ( isPluginErrorResponse( error ) && error.code === 'folder_exists' ) {
			return activatePlugin( `${ANGIE_SLUG}/${ANGIE_SLUG}` );
		}

		throw error;
	}
};

export const installAngiePlugin = async (): Promise< InstallAngieResult > => {
	try {
		await installPlugin();

		return { success: true };
	} catch ( error: unknown ) {
		if ( isPluginErrorResponse( error ) ) {
			return { success: false, error: error.message, code: error.code };
		}

		return { success: false, error: 'Unknown error occurred' };
	}
};
