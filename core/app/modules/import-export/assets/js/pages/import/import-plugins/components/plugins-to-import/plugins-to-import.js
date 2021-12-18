import { useContext } from 'react';

import { ImportContext } from '../../../../../context/import-context/import-context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';
import Heading from 'elementor-app/ui/atoms/heading';

export default function PluginsToImport( { plugins } ) {
	if ( ! plugins?.length ) {
		return null;
	}

	const { name, status } = plugins[ 0 ],
		// The Elementor Pro plugin should be displayed only if its status is inactive.
		pluginsToImport = ( 'Elementor Pro' === name && 'inactive' !== status ) ? plugins.splice( 1 ) : plugins;

	if ( ! pluginsToImport.length ) {
		return null;
	}

	const importContext = useContext( ImportContext ),
		isAllRequiredPluginsSelected = pluginsToImport.length === importContext.data.plugins.length,
		initialSelected = pluginsToImport.map( ( plugin, index ) => index ),
		handleOnSelect = ( selectedPlugins ) => importContext.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } );

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
