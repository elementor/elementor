import { useMemo } from 'react';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';
import Heading from 'elementor-app/ui/atoms/heading';

const layout = [ 4, 1 ];

export default function ExistingPlugins( { plugins } ) {
	if ( ! plugins?.length ) {
		return null;
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const existingPlugins = useMemo( () => plugins, [] ),
		// eslint-disable-next-line react-hooks/rules-of-hooks
		initialSelected = useMemo( () => plugins.map( ( plugin, index ) => index ), [] );

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
				layout={ layout }
			/>
		</div>
	);
}

ExistingPlugins.propTypes = {
	plugins: PropTypes.array,
};
