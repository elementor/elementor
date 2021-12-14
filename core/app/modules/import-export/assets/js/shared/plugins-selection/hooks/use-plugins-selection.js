const ELEMENTOR_PLUGIN_NAME = 'Elementor',
	ELEMENTOR_PRO_PLUGIN_NAME = 'Elementor Pro';

export default function usePluginsSelection( pluginsData, initialSelectedData ) {
	const initialSelected = [ ...initialSelectedData ],
		elementorPluginsNames = [ ELEMENTOR_PLUGIN_NAME, ELEMENTOR_PRO_PLUGIN_NAME ],
		elementorPluginsData = {},
		plugins = [ ...pluginsData ].filter( ( plugin ) => {
			const isElementorPlugin = elementorPluginsNames.includes( plugin.name );

			// Removing the elementor plugins data into a separated object.
			if ( isElementorPlugin ) {
				elementorPluginsData[ plugin.name ] = plugin;
			}

			return ! isElementorPlugin;
		} ),
		corePluginData = elementorPluginsData[ ELEMENTOR_PLUGIN_NAME ],
		proPluginsData = elementorPluginsData[ ELEMENTOR_PRO_PLUGIN_NAME ];

	// In case that Pro exist, registering it as the first selected plugin.
	if ( proPluginsData ) {
		// Adding the Pro as the first plugin to appears on the plugins list.
		plugins.unshift( elementorPluginsData[ ELEMENTOR_PRO_PLUGIN_NAME ] );

		if ( ! initialSelected.length ) {
			// Adding the Pro index to the initialSelected to be selected by default.
			initialSelected.push( 0 );
		}
	}

	return {
		plugins,
		initialSelected,
		corePluginData,
		proPluginsData,
	};
}
