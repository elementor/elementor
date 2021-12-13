import { arrayToObjectByKey } from 'elementor-app/utils/utils.js';

import usePlugins from './use-plugins';

const MISSING_PLUGINS_KEY = 'missing',
	EXISTING_PLUGINS_KEY = 'existing',
	ELEMENTOR_PRO_PLUGIN_KEY = 'Elementor Pro';

export default function useImportPluginsData( pluginsToInstall ) {
	const { pluginsState, pluginsActions, PLUGIN_STATUS_MAP } = usePlugins(),
		existingPlugins = pluginsState.data,
		getIsMinVersionExist = ( installedPluginVersion, kitPluginVersion ) => installedPluginVersion.localeCompare( kitPluginVersion ) > -1,
		getClassifiedPlugins = () => {
			const data = {
					missing: [],
					existing: [],
					minVersionMissing: [],
					proData: null,
				},
				installedPluginsMap = arrayToObjectByKey( existingPlugins, 'name' );

			pluginsToInstall.forEach( ( plugin ) => {
				const installedPluginData = installedPluginsMap[ plugin.name ],
					group = 'active' === installedPluginData?.status ? EXISTING_PLUGINS_KEY : MISSING_PLUGINS_KEY,
					pluginData = installedPluginData || { ...plugin, status: 'Not Installed' };

				// Verifying that the current installed plugin version is not older than the kit plugin version.
				if ( installedPluginData && ! getIsMinVersionExist( installedPluginData.version, plugin.version ) ) {
					data.minVersionMissing.push( plugin );
				}

				// In case that the Pro plugin exist, it should be displayed separately.
				if ( ELEMENTOR_PRO_PLUGIN_KEY === pluginData.name && 'inactive' !== pluginData.status ) {
					data.proData = pluginData;

					return;
				}

				data[ group ].push( pluginData );
			} );

			return data;
		};

	return {
		plugins: pluginsToInstall && existingPlugins ? getClassifiedPlugins() : null,
		pluginsActions,
	};
}
