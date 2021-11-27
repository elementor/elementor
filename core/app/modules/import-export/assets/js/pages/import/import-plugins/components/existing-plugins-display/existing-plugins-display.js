import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';

import usePlugins from '../../../../../hooks/use-plugins';

export default function ExistingPluginsTable() {
	const { pluginsState } = usePlugins(),
		existingPlugins = pluginsState.active.filter( ( plugin ) => 'Elementor' !== plugin.name ),
		existingPluginsIndexes = existingPlugins.map( ( plugin, index ) => index );

	if ( ! existingPlugins.length ) {
		re;
	}

	return (
		<PluginsSelection
			withHeader={ false }
			withStatus={ false }
			plugins={ existingPlugins }
			initialSelected={ existingPluginsIndexes }
			initialDisabled={ existingPluginsIndexes }
			excludeSelections={ existingPluginsIndexes }
			layout={ [ 4, 1 ] }
		/>
	);
}
