import apiFetch from '@wordpress/api-fetch';

import { PLUGIN_SLUG } from '../consts';

type PluginInfo = {
	plugin: string;
	status: 'active' | 'inactive' | 'network-active';
};

export const baseUrl = '/wp/v2/plugins';

export const getAngieConfig = async () => {
	const plugins = await apiFetch< PluginInfo[] >( { path: '/wp/v2/plugins' } );

	return plugins.find( ( p ) => p.plugin.startsWith( `${ PLUGIN_SLUG }/` ) );
};
