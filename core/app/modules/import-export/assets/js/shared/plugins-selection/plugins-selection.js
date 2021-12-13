import { useState, useEffect, useMemo, memo } from 'react';

import PluginsTable from './components/plugins-table';

const ELEMENTOR_PLUGIN_NAME = 'Elementor',
	ELEMENTOR_PRO_PLUGIN_NAME = 'Elementor Pro';

function PluginsSelection( props ) {
	const [ selectedData, setSelectedData ] = useState( null ),
		initialSelected = [ ...props.initialSelected ],
		elementorPluginsData = {},
		elementorPluginsNames = [ ELEMENTOR_PLUGIN_NAME, ELEMENTOR_PRO_PLUGIN_NAME ],
		plugins = [ ...props.plugins ].filter( ( plugin ) => {
			const isElementorPlugin = elementorPluginsNames.includes( plugin.name );

			if ( isElementorPlugin ) {
				elementorPluginsData[ plugin.name ] = plugin;
			}

			return ! isElementorPlugin;
		} ),
		corePluginData = elementorPluginsData[ ELEMENTOR_PLUGIN_NAME ],
		onPluginsSelection = () => {
			const selectedPluginsList = [];

			// If exist, adding the Core as the first plugin of the selected plugins list because it should not be displayed in the table.
			if ( corePluginData ) {
				selectedPluginsList.push( corePluginData );
			}

			selectedData.forEach( ( pluginIndex ) => selectedPluginsList.push( plugins[ pluginIndex ] ) );

			props.onSelect( selectedPluginsList );
		};

	// In case that Pro exist, registering it as the first selected plugin.
	if ( elementorPluginsData[ ELEMENTOR_PRO_PLUGIN_NAME ] ) {
		// Adding the Pro as the first plugin to appears on the plugins list.
		plugins.unshift( elementorPluginsData[ ELEMENTOR_PRO_PLUGIN_NAME ] );

		if ( ! initialSelected.length ) {
			// Adding the Pro index to the initialSelected to be selected by default.
			initialSelected.push( 0 );
		}
	}

	const cachedPlugins = useMemo( () => plugins, [ props.plugins ] ),
		cachedInitialSelected = useMemo( () => initialSelected, [ props.plugins ] ),
		cachedInitialDisabled = useMemo( () => props.initialDisabled, [ props.plugins ] );

	useEffect( () => {
		if ( props.onSelect && selectedData ) {
			onPluginsSelection();
		}
	}, [ selectedData ] );

	if ( ! props.plugins.length ) {
		return null;
	}

	return (
		<PluginsTable
			initialDisabled={ cachedInitialDisabled }
			plugins={ cachedPlugins }
			onSelect={ setSelectedData }
			initialSelected={ cachedInitialSelected }
			withHeader={ props.withHeader }
			withStatus={ props.withStatus }
			layout={ props.layout }
		/>
	);
}

PluginsSelection.propTypes = {
	initialDisabled: PropTypes.array,
	initialSelected: PropTypes.array,
	layout: PropTypes.array,
	onSelect: PropTypes.func,
	plugins: PropTypes.array,
	selection: PropTypes.bool,
	withHeader: PropTypes.bool,
	withStatus: PropTypes.bool,
};

PluginsSelection.defaultProps = {
	initialDisabled: [],
	initialSelected: [],
	plugins: [],
	selection: true,
	withHeader: true,
	withStatus: true,
};

export default memo( PluginsSelection );
