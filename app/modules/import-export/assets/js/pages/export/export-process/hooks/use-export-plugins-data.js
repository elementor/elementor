import { useMemo } from 'react';

export default function useExportPluginsData( plugins ) {
	const getData = () => {
			const pluginsData = [];

			plugins.forEach( ( pluginData ) => {
				const { name, plugin, plugin_uri: pluginUri, version } = pluginData;

				pluginsData.push( {
					name,
					plugin,
					pluginUri,
					version,
				} );
			} );

			return pluginsData;
		};

	return {
		pluginsData: useMemo( () => getData(), [ plugins ] ),
	};
}
