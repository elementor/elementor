import { useMemo } from 'react';

export const PLUGINS_KEYS = Object.freeze( {
	ELEMENTOR: 'Elementor',
	ELEMENTOR_PRO: 'Elementor Pro',
} );

export default function usePluginsData( plugins ) {
	const getPluginsData = () => {
		if ( ! plugins ) {
			return [];
		}

		const elementorPlugins = [],
			generalPlugins = [];

		plugins.forEach( ( plugin ) => {
			switch ( plugin.name ) {
				case PLUGINS_KEYS.ELEMENTOR:
					// Making sure that the core plugin is always first.
					elementorPlugins.unshift( plugin );
					break;
				case PLUGINS_KEYS.ELEMENTOR_PRO:
					// Making sure that the pro plugin is always second.
					elementorPlugins.push( plugin );
					break;
				default:
					generalPlugins.push( plugin );
			}
		} );

		// Making sure that the elementor plugins are always first.
		return elementorPlugins.concat( generalPlugins );
	};

	return {
		pluginsData: useMemo( () => getPluginsData(), [ plugins ] ),
	};
}
