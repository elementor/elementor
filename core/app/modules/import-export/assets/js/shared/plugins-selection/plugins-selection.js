import { useState, useEffect, useContext, useCallback, useMemo } from 'react';

import { Context } from '../../context/context-provider';

import PluginsTable from './components/plugins-table';

import './plugins-selection.scss';

const ELEMENTOR_PLUGIN_NAME = 'Elementor',
	ELEMENTOR_PRO_PLUGIN_NAME = 'Elementor Pro';

export default function PluginsSelection( props ) {
	const [ selectedData, setSelectedData ] = useState( null ),
		context = useContext( Context ),
		elementorPluginsNames = [ ELEMENTOR_PLUGIN_NAME, ELEMENTOR_PRO_PLUGIN_NAME ],
		initialSelections = [ ...props.initialSelections ],
		elementorPluginsData = {},
		plugins = [ ...props.plugins ].filter( ( data ) => {
			const isElementorPlugin = elementorPluginsNames.includes( data.name );

			if ( isElementorPlugin ) {
				elementorPluginsData[ data.name ] = data;
			}

			return ! isElementorPlugin;
		} );

	// In case that Pro exist, registering it as the first selected plugin.
	if ( elementorPluginsData[ ELEMENTOR_PRO_PLUGIN_NAME ] ) {
		// Adding the Pro as the first plugin to appears on the plugins list.
		plugins.unshift( elementorPluginsData[ ELEMENTOR_PRO_PLUGIN_NAME ] );

		if ( ! initialSelections.length ) {
			// Adding the Pro index to the initialSelections to be selected by default.
			initialSelections.push( 0 );
		}
	}

	const cachedPlugins = useMemo( () => plugins, [ props.plugins ] ),
		cachedInitialSelections = useMemo( () => initialSelections, [ props.plugins ] ),
		cachedInitialDisabled = useMemo( () => props.initialDisabled, [ props.plugins ] );

	// Updating the selected plugins list in the global context.
	useEffect( () => {
		if ( selectedData ) {
			// Adding Elementor-Core as the first plugin of the selected plugins list.
			const corePluginData = elementorPluginsData[ ELEMENTOR_PLUGIN_NAME ],
				selectedPluginsList = [ corePluginData ];

			selectedData.map( ( pluginIndex ) => selectedPluginsList.push( plugins[ pluginIndex ] ) );

			context.dispatch( { type: 'SET_PLUGINS', payload: selectedPluginsList } );
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
			initialSelections={ cachedInitialSelections }
			withHeader={ props.withHeader }
		/>
	);
}

PluginsSelection.propTypes = {
	initialDisabled: PropTypes.array,
	initialSelections: PropTypes.array,
	plugins: PropTypes.array,
	selection: PropTypes.bool,
	withHeader: PropTypes.bool,
};

PluginsSelection.defaultProps = {
	initialDisabled: [],
	initialSelections: [],
	plugins: [],
	selection: true,
	withHeader: true,
};
