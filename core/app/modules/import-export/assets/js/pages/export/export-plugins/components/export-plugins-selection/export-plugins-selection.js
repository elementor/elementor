import { useContext } from 'react';

import { ExportContext } from '../../../../../context/export-context/export-context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';
import Loader from '../../../../../ui/loader/loader';

import usePlugins from '../../../../../hooks/use-plugins';

const ELEMENTOR_PLUGIN_KEY = 'Elementor';

export default function ExportPluginsSelection( { onPluginsSelection, onNoSelection } ) {
	const exportContext = useContext( ExportContext ),
		{ pluginsState } = usePlugins(),
		activePlugins = pluginsState.data ? pluginsState.data.filter( ( { status } ) => 'active' === status ) : [],
		getIsPluginsSelectionNeeded = ( plugins ) => {
			// In case that there are at least two plugins it means that Elementor is not the only plugin to export.
			if ( plugins.length > 1 ) {
				return true;
			}

			// Making sure that Elementor is not the only plugin to export.
			return 1 === plugins.length && ELEMENTOR_PLUGIN_KEY !== plugins[ 0 ].name;
		},
		handleOnSelect = ( selectedPlugins ) => {
			exportContext.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } );

			// In case Elementor core is the only plugin to export, no selection is needed and the plugin should be exported by default.
			if ( getIsPluginsSelectionNeeded( selectedPlugins ) ) {
				onPluginsSelection();
			} else {
				onNoSelection();
			}
		};

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
	onPluginsSelection: PropTypes.func.isRequired,
	onNoSelection: PropTypes.func.isRequired,
};
