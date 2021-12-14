import { useState, useEffect, useMemo, memo } from 'react';

import PluginsTable from './components/plugins-table';

import usePluginsSelection from './hooks/use-plugins-selection';

function PluginsSelection( props ) {
	if ( ! props.plugins.length ) {
		return null;
	}

	const [ selectedData, setSelectedData ] = useState( null ),
		{ plugins, initialSelected, corePluginData } = usePluginsSelection( props.plugins, props.initialSelected ),
		onPluginsSelection = () => {
			const selectedPluginsList = [];

			// If exist, adding the Core as the first plugin of the selected plugins list because it should not be displayed in the table.
			if ( corePluginData ) {
				selectedPluginsList.push( corePluginData );
			}

			selectedData.forEach( ( pluginIndex ) => selectedPluginsList.push( plugins[ pluginIndex ] ) );

			props.onSelect( selectedPluginsList );
		},
		cachedPlugins = useMemo( () => plugins, [ props.plugins ] ),
		cachedInitialSelected = useMemo( () => initialSelected, [ props.plugins ] ),
		cachedInitialDisabled = useMemo( () => props.initialDisabled, [ props.plugins ] );

	useEffect( () => {
		if ( props.onSelect && selectedData ) {
			onPluginsSelection();
		}
	}, [ selectedData ] );

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
