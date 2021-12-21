const PLUGINS_KEYS = Object.freeze( {
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
			if ( PLUGINS_KEYS.ELEMENTOR === plugin.name ) {
				// Making sure that the core plugin is always first.
				elementorPlugins.unshift( plugin );
			} else if ( PLUGINS_KEYS.ELEMENTOR_PRO === plugin.name ) {
				// Making sure that the pro plugin is always second.
				elementorPlugins.push( plugin );
			} else {
				generalPlugins.push( plugin );
			}
		} );

		// Making sure that the elementor plugins are always first.
		return elementorPlugins.concat( generalPlugins );
	};

	return {
		pluginsData: getPluginsData(),
		PLUGINS_KEYS,
	};
}
