import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_SITE_CONTENT_SORT, type SiteContentSortOption } from '../site-content-sort';
import {
	EMPTY_SITE_CONTENT_STATUS_FILTERS,
	type SiteContentSelectableStatus,
	type SiteContentStatusFilters,
	toggleSiteContentStatusFilter,
} from '../site-content-status-filter';

const SEARCH_DEBOUNCE_MS = 300;

export function useSiteContentSectionListControls() {
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ debouncedSearch, setDebouncedSearch ] = useState( '' );
	const [ siteContentSort, setSiteContentSortState ] = useState< SiteContentSortOption >( DEFAULT_SITE_CONTENT_SORT );
	const [ statusFilters, setStatusFilters ] = useState< SiteContentStatusFilters >(
		EMPTY_SITE_CONTENT_STATUS_FILTERS
	);

	const trimmedSearch = searchQuery.trim();

	useEffect( () => {
		const handle = window.setTimeout( () => setDebouncedSearch( trimmedSearch ), SEARCH_DEBOUNCE_MS );

		return () => window.clearTimeout( handle );
	}, [ trimmedSearch ] );

	const clearActiveToolbarFilters = useCallback( () => {
		setSiteContentSortState( DEFAULT_SITE_CONTENT_SORT );
		setStatusFilters( EMPTY_SITE_CONTENT_STATUS_FILTERS );
	}, [] );

	const clearSiteContentSort = useCallback( () => {
		setSiteContentSortState( DEFAULT_SITE_CONTENT_SORT );
	}, [] );

	const clearStatusFilters = useCallback( () => {
		setStatusFilters( EMPTY_SITE_CONTENT_STATUS_FILTERS );
	}, [] );

	const setSiteContentSort = useCallback( ( sort: SiteContentSortOption ) => {
		setSiteContentSortState( sort );
	}, [] );

	const toggleStatusFilter = useCallback( ( filter: SiteContentSelectableStatus ) => {
		setStatusFilters( ( current ) => toggleSiteContentStatusFilter( current, filter ) );
	}, [] );

	return {
		clearActiveToolbarFilters,
		clearSiteContentSort,
		clearStatusFilters,
		debouncedSearch,
		searchQuery,
		setSearchQuery,
		setSiteContentSort,
		siteContentSort,
		statusFilters,
		toggleStatusFilter,
	};
}

export type SiteContentSectionListControls = ReturnType< typeof useSiteContentSectionListControls >;
