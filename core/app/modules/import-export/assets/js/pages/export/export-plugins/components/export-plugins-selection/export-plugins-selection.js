import { useContext, useEffect } from 'react';

import { ExportContext } from '../../../../../context/export-context/export-context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';
import Loader from '../../../../../ui/loader/loader';

import usePlugins from '../../../../../hooks/use-plugins';

export default function ExportPluginsSelection( { onPluginsReady } ) {
	const exportContext = useContext( ExportContext ),
		{ pluginsState, pluginsActions, PLUGIN_STATUS_MAP, PLUGINS_RESPONSE_MAP } = usePlugins(),
		activePlugins = pluginsState.data ? pluginsState.data.filter( ( { status } ) => PLUGIN_STATUS_MAP.ACTIVE === status ) : [],
		handleOnSelect = ( selectedPlugins ) => exportContext.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } );

	// On load.
	useEffect( () => {
		pluginsActions.get();
	}, [] );

	// On plugins ready.
	useEffect( () => {
		if ( PLUGINS_RESPONSE_MAP.SUCCESS === pluginsState.status ) {
			onPluginsReady( activePlugins );
		}
	}, [ pluginsState.status ] );

	if ( ! pluginsState.data ) {
		return <Loader absoluteCenter />;
	}

	return (
		<PluginsSelection
			plugins={ activePlugins }
			withStatus={ false }
			onSelect={ handleOnSelect }
			layout={ [ 3, 1 ] }
		/>
	);
}

ExportPluginsSelection.propTypes = {
	onPluginsReady: PropTypes.func.isRequired,
};
