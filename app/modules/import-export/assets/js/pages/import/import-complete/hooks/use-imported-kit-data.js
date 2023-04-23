import { PLUGIN_STATUS_MAP } from '../../../../hooks/use-plugins';

export default function useImportedKitData() {
	const getTemplates = ( templates, importedData ) => {
			const kitTemplates = {};

			for ( const key in importedData?.templates?.succeed ) {
				kitTemplates[ key ] = templates[ key ];
			}

			return kitTemplates;
		},
		getContent = ( content, importedData ) => {
			const kitContent = {};

			for ( const contentType in importedData?.content ) {
				kitContent[ contentType ] = {};

				for ( const key in importedData.content[ contentType ]?.succeed ) {
					kitContent[ contentType ][ key ] = content[ contentType ][ key ];
				}
			}

			return kitContent;
		},
		getWPContent = ( content, importedData ) => {
			const kitWPContent = {};

			for ( const contentType in importedData?.[ 'wp-content' ] ) {
				const succeededItems = importedData[ 'wp-content' ][ contentType ]?.succeed;

				kitWPContent[ contentType ] = succeededItems ? Object.keys( succeededItems ) : [];
			}

			return kitWPContent;
		},
		getPlugins = ( importedPlugins ) => {
			const plugins = {
				activePlugins: [],
				failedPlugins: [],
			};

			importedPlugins.forEach( ( plugin ) => {
				const group = PLUGIN_STATUS_MAP.ACTIVE === plugin.status ? 'activePlugins' : 'failedPlugins';

				plugins[ group ].push( plugin );
			} );

			return plugins;
		};

	return {
		getTemplates,
		getContent,
		getWPContent,
		getPlugins,
	};
}
