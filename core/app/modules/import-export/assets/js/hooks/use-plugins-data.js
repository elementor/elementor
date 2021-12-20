const ELEMENTOR_PLUGIN_NAME = 'Elementor',
	ELEMENTOR_PRO_PLUGIN_NAME = 'Elementor Pro';

export default function usePluginsData( plugins ) {
	const getPluginsData = () => {
		if ( ! plugins ) {
			return [];
		}

		const elementorPlugins = [],
			generalPlugins = [];

		plugins.forEach( ( plugin ) => {
			if ( ELEMENTOR_PLUGIN_NAME === plugin.name ) {
				// Making sure that the core plugin is always first.
				elementorPlugins.unshift( plugin );
			} else if ( ELEMENTOR_PRO_PLUGIN_NAME === plugin.name ) {
				// Making sure that the pro plugin is always second.
				elementorPlugins.push( plugin );
			} else {
				generalPlugins.push( plugin );
			}
		} );

		// Making sure that the elementor plugins are always first.
		return [ ...elementorPlugins, ...generalPlugins ];
	};

	return {
		pluginsData: getPluginsData(),
	};
}
