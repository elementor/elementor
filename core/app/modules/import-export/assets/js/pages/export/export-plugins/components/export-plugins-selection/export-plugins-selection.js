import { useContext } from 'react';
import { Context } from '../../../../../context/context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';

import usePlugins from '../../../../../hooks/use-plugins';

export default function ExportPluginsSelection() {
	const context = useContext( Context ),
		{ pluginsState } = usePlugins(),
		activePlugins = pluginsState.data ? pluginsState.data.filter( ( { status } ) => 'active' === status ) : [],
		handleOnSelect = ( selectedPlugins ) => context.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } );

	return (
		<PluginsSelection
			plugins={ activePlugins }
			withStatus={ false }
			onSelect={ handleOnSelect }
		/>
	);
}
