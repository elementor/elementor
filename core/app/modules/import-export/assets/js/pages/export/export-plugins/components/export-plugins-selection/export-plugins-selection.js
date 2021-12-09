import { useContext, useEffect } from 'react';
import { Context } from '../../../../../context/context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';

import usePlugins from '../../../../../hooks/use-plugins';

export default function ExportPluginsSelection() {
	const context = useContext( Context ),
		{ pluginsData, pluginsActions } = usePlugins(),
		activePlugins = pluginsData ? pluginsData.filter( ( { status } ) => 'active' === status ) : [],
		handleOnSelect = ( selectedPlugins ) => context.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } );

	console.log( 'pluginsData', pluginsData );

	return (
		<PluginsSelection
			plugins={ activePlugins }
			withStatus={ false }
			onSelect={ handleOnSelect }
		/>
	);
}
