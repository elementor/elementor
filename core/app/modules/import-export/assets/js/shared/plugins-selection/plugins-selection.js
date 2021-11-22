import { useState, useEffect, useContext, useMemo } from 'react';

import { Context } from '../../context/context-provider';

import PluginsTable from './components/plugins-table';

import './plugins-selection.scss';

const ELEMENTOR_PLUGIN_NAME = 'Elementor',
	ELEMENTOR_PRO_PLUGIN_NAME = 'Elementor Pro';

export default function PluginsSelection( props ) {
	const context = useContext( Context ),
		[ selectedData, setSelectedData ] = useState( null ),
		initialSelected = [ ...props.initialSelected ],
		elementorPluginsData = {},
		elementorPluginsNames = [ ELEMENTOR_PLUGIN_NAME, ELEMENTOR_PRO_PLUGIN_NAME ],
		plugins = [ ...props.plugins ].filter( ( data ) => {
			const isElementorPlugin = elementorPluginsNames.includes( data.name );

			if ( isElementorPlugin ) {
				elementorPluginsData[ data.name ] = data;
			}

			return ! isElementorPlugin;
		} ),
		corePluginData = elementorPluginsData[ ELEMENTOR_PLUGIN_NAME ];

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

	// Updating the selected plugins list in the global context.
	useEffect( () => {
		if ( selectedData ) {
			const selectedPluginsList = [];

			/*
			* If exist, adding the Elementor-Core as the first plugin of the selected plugins list.
			* Because there is no scenario that it should be displayed in the table, but it should be selected by default if exist.
			*/
			if ( corePluginData ) {
				selectedPluginsList.push( corePluginData );
			}

			selectedData.forEach( ( pluginIndex ) => {
				// Adding the plugin index to the selected plugins list as long as it's not excluded.
				if ( ! props.excludeSelections.includes( pluginIndex ) ) {
					selectedPluginsList.push( plugins[ pluginIndex ] );
				}

				selectedPluginsList.push( plugins[ pluginIndex ] );
			} );

			if ( selectedPluginsList.length ) {
				context.dispatch( { type: 'SET_PLUGINS', payload: selectedPluginsList } );
			}
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
	excludeSelections: PropTypes.array,
	initialDisabled: PropTypes.array,
	initialSelected: PropTypes.array,
	layout: PropTypes.array,
	plugins: PropTypes.array,
	selection: PropTypes.bool,
	withHeader: PropTypes.bool,
	withStatus: PropTypes.bool,
};

PluginsSelection.defaultProps = {
	excludeSelections: [],
	initialDisabled: [],
	initialSelected: [],
	plugins: [],
	selection: true,
	withHeader: true,
	withStatus: true,
};
