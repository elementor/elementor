import { useContext, useEffect } from 'react';
import { Context } from '../../../../../context/context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';

import usePlugins from '../../../../../hooks/use-plugins';

export default function ExportPluginsSelection() {
	const context = useContext( Context ),
		{ pluginsState, pluginsActions } = usePlugins(),
		handleOnSelect = ( selectedPlugins ) => context.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } );

	useEffect( () => {
		pluginsActions.get();
	}, [] );

	return (
		<PluginsSelection
			plugins={ pluginsState.data?.active }
			withStatus={ false }
			onSelect={ handleOnSelect }
		/>
	);
}
