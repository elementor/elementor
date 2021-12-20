import { useContext, useEffect } from 'react';

import { ExportContext } from '../../../../../context/export-context/export-context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';
import Loader from '../../../../../ui/loader/loader';

import usePlugins from '../../../../../hooks/use-plugins';
import usePluginsData from '../../../../../hooks/use-plugins-data';

export default function ExportPluginsSelection() {
	const exportContext = useContext( ExportContext ),
		{ pluginsState, pluginsActions, PLUGIN_STATUS_MAP, PLUGINS_RESPONSE_MAP } = usePlugins(),
		{ pluginsData } = usePluginsData( pluginsState.data ),
		activePlugins = pluginsData.filter( ( { status } ) => PLUGIN_STATUS_MAP.ACTIVE === status ),
		handleOnSelect = ( selectedPlugins ) => exportContext.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } ),
		getInitialSelected = () => {
			// Elementor Core will always be th
			const initialSelected = [ 0 ];

			// In case that Elementor Pro appears in the list it will always be second and should always be selected by default.
			if ( activePlugins.length > 1 && 'Elementor Pro' === activePlugins[ 1 ].name ) {
				initialSelected.push( 1 );
			}

			return initialSelected;
		};

	// On load.
	useEffect( () => {
		pluginsActions.get();
	}, [] );

	if ( ! pluginsState.data ) {
		return <Loader absoluteCenter />;
	}

	return (
		<PluginsSelection
			plugins={ activePlugins }
			initialSelected={ getInitialSelected() }
			initialDisabled={ [ 0 ] /* Elementor Core will always be first and should always be disabled */ }
			layout={ [ 3, 1 ] }
			withStatus={ false }
			onSelect={ handleOnSelect }
		/>
	);
}
