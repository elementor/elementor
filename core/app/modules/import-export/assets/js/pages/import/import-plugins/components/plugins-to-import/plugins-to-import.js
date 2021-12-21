import { useContext } from 'react';

import { ImportContext } from '../../../../../context/import-context/import-context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';
import Heading from 'elementor-app/ui/atoms/heading';

import usePlugins from '../../../../../hooks/use-plugins';
import usePluginsData from '../../../../../hooks/use-plugins-data';

export default function PluginsToImport( { plugins } ) {
	if ( ! plugins?.length ) {
		return null;
	}

	const importContext = useContext( ImportContext ),
		{ PLUGIN_STATUS_MAP } = usePlugins(),
		{ PLUGINS_KEYS } = usePluginsData(),
		getPluginsToImport = () => {
			let startPluginsCutPosition = 0;

			// If Elementor Core is the first plugins it should not be displayed.
			if ( PLUGINS_KEYS.ELEMENTOR === plugins[ 0 ].name ) {
				startPluginsCutPosition++;
			}

			// If Elementor Pro is the second plugin and is not inactive, it should not be displayed.
			if ( plugins.length > 1 && PLUGINS_KEYS.ELEMENTOR_PRO === plugins[ 1 ].name && PLUGIN_STATUS_MAP.INACTIVE !== plugins[ 1 ].status ) {
				startPluginsCutPosition++;
			}

			return plugins.splice( startPluginsCutPosition );
		},
		pluginsToImport = getPluginsToImport(),
		isAllRequiredPluginsSelected = pluginsToImport.length === importContext.data.plugins.length,
		initialSelected = pluginsToImport.map( ( plugin, index ) => index ),
		handleOnSelect = ( selectedPlugins ) => importContext.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } );

	if ( ! pluginsToImport.length ) {
		return null;
	}

	return (
		<div className="e-app-import-plugins__section">
			<Heading variant="h5" tag="h3" className="e-app-import-plugins__section-heading">
				{
					isAllRequiredPluginsSelected ?
					__( 'Plugins to add:', 'elementor' ) :
					__( 'Missing Required Plugins:', 'elementor' )
				}
			</Heading>

			<PluginsSelection
				plugins={ pluginsToImport }
				initialSelected={ initialSelected }
				onSelect={ handleOnSelect }
				layout={ [ 3, 1, 1 ] }
			/>
		</div>
	);
}

PluginsToImport.propTypes = {
	plugins: PropTypes.array,
};
