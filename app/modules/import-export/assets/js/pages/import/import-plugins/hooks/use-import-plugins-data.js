import { useMemo } from 'react';

import { arrayToObjectByKey } from 'elementor-app/utils/utils.js';

import { PLUGIN_STATUS_MAP } from '../../../../hooks/use-plugins';

const MISSING_PLUGINS_KEY = 'missing',
	EXISTING_PLUGINS_KEY = 'existing',
	ELEMENTOR_PRO_PLUGIN_KEY = 'Elementor Pro';

export default function useImportPluginsData( pluginsToInstall, existingPlugins ) {
	const getIsMinVersionExist = ( installedPluginVersion, kitPluginVersion ) => installedPluginVersion.localeCompare( kitPluginVersion ) > -1,
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
					group = PLUGIN_STATUS_MAP.ACTIVE === installedPluginData?.status ? EXISTING_PLUGINS_KEY : MISSING_PLUGINS_KEY,
					pluginData = installedPluginData || { ...plugin, status: PLUGIN_STATUS_MAP.NOT_INSTALLED };

				// Verifying that the current installed plugin version is not older than the kit plugin version.
				if ( installedPluginData && ! getIsMinVersionExist( installedPluginData.version, plugin.version ) ) {
					data.minVersionMissing.push( plugin );
				}

				// In case that the Pro plugin exist saving the data separately for easily knowing if the pro exist or not.
				if ( ELEMENTOR_PRO_PLUGIN_KEY === pluginData.name ) {
					data.proData = pluginData;
				}

				data[ group ].push( pluginData );
			} );

			return data;
		},
		classifiedPlugins = useMemo( () => getClassifiedPlugins(), [ pluginsToInstall, existingPlugins ] );

	return {
		importPluginsData: pluginsToInstall.length && existingPlugins.length ? classifiedPlugins : null,
	};
}
