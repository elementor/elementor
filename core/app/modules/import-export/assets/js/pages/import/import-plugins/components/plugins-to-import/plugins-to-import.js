import { useContext, useMemo, useCallback } from 'react';

import { ImportContext } from '../../../../../context/import-context/import-context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';
import Heading from 'elementor-app/ui/atoms/heading';

import { PLUGIN_STATUS_MAP } from '../../../../../hooks/use-plugins';
import { PLUGINS_KEYS } from '../../../../../hooks/use-plugins-data';

const layout = [ 3, 1, 1 ];

export default function PluginsToImport( { plugins } ) {
	if ( ! plugins?.length ) {
		return null;
	}

	const importContext = useContext( ImportContext ),
		getPluginsToImport = () => {
			const { name, status } = plugins[ 0 ];

			// If Elementor Pro is the first plugin and is not inactive, it should not be displayed.
			if ( PLUGINS_KEYS.ELEMENTOR_PRO === name && PLUGIN_STATUS_MAP.INACTIVE !== status ) {
				return plugins.splice( 1 );
			}

			return plugins;
		},
		handleOnSelect = useCallback( ( selectedPlugins ) => importContext.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } ), [] ),
		pluginsToImport = useMemo( () => getPluginsToImport(), [ plugins ] ),
		initialSelected = useMemo( () => pluginsToImport.map( ( plugin, index ) => index ), [ plugins ] ),
		isAllRequiredPluginsSelected = pluginsToImport.length === importContext.data.plugins.length;

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
				layout={ layout }
			/>
		</div>
	);
}

PluginsToImport.propTypes = {
	plugins: PropTypes.array,
};
