import { useContext, useMemo, useCallback, useEffect } from 'react';
import { Context } from '../../../../../context/context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';
import usePlugins from '../../../../../hooks/use-plugins';

export default function ImportPluginsTable() {
	const context = useContext( Context ),
		{ pluginsState } = usePlugins(),
		plugins = pluginsState.installed.filter( ( plugin ) => 'active' !== plugin.status ),
		initialSelected = plugins.map( ( plugin, index ) => index ),
		handleOnSelect = ( selectedPlugins ) => context.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } );

	useEffect( () => {
		console.log( 'plugins', context.data.plugins );
	}, [ context.data.plugins ] );

	useEffect( () => {
		console.log( 'pluginsState', pluginsState );
	}, [ pluginsState ] );

	return (
		<PluginsSelection
			plugins={ plugins }
			initialSelected={ initialSelected }
			onSelect={ handleOnSelect }
			layout={ [ 3, 1, 1 ] }
		/>
	);
}
