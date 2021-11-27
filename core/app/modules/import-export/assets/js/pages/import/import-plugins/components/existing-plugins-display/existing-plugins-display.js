import { Context } from '../../../../../context/context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';

import Heading from 'elementor-app/ui/atoms/heading';

import usePlugins from '../../../../../hooks/use-plugins';

export default function ExistingPluginsDisplay() {
	const context = useContext( Context ),
		{ pluginsState } = usePlugins(),
		pluginsToImport = content.data.uploadedData.manifest.plugins,
		existingPlugins = pluginsState.active.filter( ( plugin ) => 'Elementor' !== plugin.name ),
		existingPluginsIndexes = existingPlugins.map( ( plugin, index ) => index );

	if ( ! existingPlugins.length ) {
		return null;
	}

	return (
		<div className="e-app-import-plugins__section">
			<Heading variant="h5" tag="h3" className="e-app-import-plugins__section-heading">{ __( 'Plugins you already have:', 'elementor' ) }</Heading>

			<PluginsSelection
				withHeader={ false }
				withStatus={ false }
				plugins={ existingPlugins }
				initialSelected={ existingPluginsIndexes }
				initialDisabled={ existingPluginsIndexes }
				excludeSelections={ existingPluginsIndexes }
				layout={ [ 4, 1 ] }
			/>
		</div>
	);
}
