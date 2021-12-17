import { useContext, useEffect } from 'react';

import { Context } from '../../../../../context/context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';
import Loader from '../../../../../ui/loader/loader';

import usePlugins from '../../../../../hooks/use-plugins';

export default function ExportPluginsSelection( { onPluginsReady } ) {
	const context = useContext( Context ),
		{ pluginsState, PLUGINS_RESPONSE_MAP } = usePlugins(),
		activePlugins = pluginsState.data ? pluginsState.data.filter( ( { status } ) => 'active' === status ) : [],
		handleOnSelect = ( selectedPlugins ) => context.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } );

	useEffect( () => {
		if ( PLUGINS_RESPONSE_MAP.SUCCESS === pluginsState.status ) {
			onPluginsReady( activePlugins );
		}
	}, [ pluginsState ] );

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
	onPluginsReady: PropTypes.func,
};
