import { useMemo, memo } from 'react';

import PluginsTable from './components/plugins-table';

function PluginsSelection( {
	plugins,
	initialSelected,
	initialDisabled,
	withHeader,
	withStatus,
	layout,
	onSelect,
} ) {
	if ( ! plugins.length ) {
		return null;
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const cachedPlugins = useMemo( () => plugins, [ plugins ] ),
		// eslint-disable-next-line react-hooks/rules-of-hooks
		cachedInitialSelected = useMemo( () => initialSelected, [ plugins ] ),
		// eslint-disable-next-line react-hooks/rules-of-hooks
		cachedInitialDisabled = useMemo( () => initialDisabled, [ plugins ] ),
		handleOnSelect = ( selectedIndexes ) => {
			if ( ! onSelect ) {
				return;
			}

			const selectedPlugins = selectedIndexes.map( ( pluginIndex ) => plugins[ pluginIndex ] );

			onSelect( selectedPlugins );
		};

	return (
		<PluginsTable
			plugins={ cachedPlugins }
			initialDisabled={ cachedInitialDisabled }
			initialSelected={ cachedInitialSelected }
			onSelect={ handleOnSelect }
			withHeader={ withHeader }
			withStatus={ withStatus }
			layout={ layout }
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
