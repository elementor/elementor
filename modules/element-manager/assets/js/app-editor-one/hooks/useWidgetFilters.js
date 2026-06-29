import { useState, useMemo, useCallback } from 'react';

export const useWidgetFilters = ( widgets, widgetsDisabled, getWidgetUsage ) => {
	const [ searchKeyword, setSearchKeyword ] = useState( '' );
	const [ sortingColumn, setSortingColumn ] = useState( 'widget' );
	const [ sortingDirection, setSortingDirection ] = useState( 'asc' );
	const [ filterByPlugin, setFilterByPlugin ] = useState( '' );
	const [ filterByStatus, setFilterByStatus ] = useState( 'all' );

	const sortedAndFilteredWidgets = useMemo( () => {
		let filteredWidgets = widgets.filter( ( widget ) => {
			return widget.title.toLowerCase().includes( searchKeyword.toLowerCase() );
		} );

		if ( '' !== filterByPlugin ) {
			filteredWidgets = filteredWidgets.filter( ( widget ) => {
				return widget.plugin.toLowerCase() === filterByPlugin.toLowerCase();
			} );
		}

		if ( 'all' !== filterByStatus ) {
			filteredWidgets = filteredWidgets.filter( ( widget ) => {
				if ( 'active' === filterByStatus ) {
					return ! widgetsDisabled.includes( widget.name );
				}
				return widgetsDisabled.includes( widget.name );
			} );
		}

		filteredWidgets.sort( ( a, b ) => {
			let aValue;
			let bValue;

			if ( 'widget' === sortingColumn ) {
				aValue = a.title;
				bValue = b.title;
			}

			if ( 'usage' === sortingColumn ) {
				aValue = getWidgetUsage( a.name );
				bValue = getWidgetUsage( b.name );
			}

			if ( aValue === bValue ) {
				return 0;
			}

			if ( 'asc' === sortingDirection ) {
				return aValue < bValue ? -1 : 1;
			}

			return aValue > bValue ? -1 : 1;
		} );

		return filteredWidgets;
	}, [ widgets, searchKeyword, sortingColumn, sortingDirection, filterByPlugin, filterByStatus, widgetsDisabled, getWidgetUsage ] );

	const getSortingIndicatorClasses = useCallback( ( column ) => {
		if ( sortingColumn !== column ) {
			return '';
		}
		return 'asc' === sortingDirection ? 'sorted asc' : 'sorted desc';
	}, [ sortingColumn, sortingDirection ] );

	const onSortingClicked = useCallback( ( column ) => {
		if ( sortingColumn === column ) {
			setSortingDirection( ( prev ) => ( 'asc' === prev ? 'desc' : 'asc' ) );
		} else {
			setSortingColumn( column );
			setSortingDirection( 'asc' );
		}
	}, [ sortingColumn ] );

	const setSortByUsage = useCallback( () => {
		setSortingColumn( 'usage' );
		setSortingDirection( 'desc' );
	}, [] );

	return {
		searchKeyword,
		setSearchKeyword,
		filterByPlugin,
		setFilterByPlugin,
		filterByStatus,
		setFilterByStatus,
		sortedAndFilteredWidgets,
		getSortingIndicatorClasses,
		onSortingClicked,
		setSortByUsage,
	};
};

