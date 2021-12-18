import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';
import Heading from 'elementor-app/ui/atoms/heading';

export default function ExistingPlugins( { plugins } ) {
	if ( ! plugins?.length ) {
		return null;
	}

	const existingPlugins = plugins.filter( ( plugin ) => ! [ 'Elementor', 'Elementor Pro' ].includes( plugin.name ) );

	if ( ! existingPlugins.length ) {
		return null;
	}

	const initialSelected = existingPlugins.map( ( plugin, index ) => index );

	return (
		<div className="e-app-import-plugins__section">
			<Heading variant="h5" tag="h3" className="e-app-import-plugins__section-heading">
				{ __( 'Plugins you already have:', 'elementor' ) }
			</Heading>

			<PluginsSelection
				withHeader={ false }
				withStatus={ false }
				plugins={ existingPlugins }
				initialSelected={ initialSelected }
				initialDisabled={ initialSelected }
				excludeSelections={ initialSelected }
				layout={ [ 4, 1 ] }
			/>
		</div>
	);
}

ExistingPlugins.propTypes = {
	plugins: PropTypes.array,
};
