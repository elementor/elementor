import * as React from 'react';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { type Slug } from '../api/post';
import { DEFAULT_SITE_CONTENT_SORT, type SiteContentSortOption } from '../site-content-sort';
import {
	EMPTY_SITE_CONTENT_STATUS_FILTERS,
	type SiteContentSelectableStatus,
	type SiteContentStatusFilters,
	toggleSiteContentStatusFilter,
} from '../site-content-status-filter';

type SectionHandlers = {
	setExpanded: ( expanded: boolean ) => void;
	startCreate: () => void;
};

type ContentPanelCoordinatorValue = {
	clearActiveToolbarFilters: () => void;
	clearSiteContentSort: () => void;
	clearStatusFilters: () => void;
	registerSection: ( type: Slug, handlers: SectionHandlers ) => void;
	requestCreate: ( type: Slug ) => void;
	searchQuery: string;
	setSearchQuery: ( query: string ) => void;
	setSiteContentSort: ( sort: SiteContentSortOption ) => void;
	siteContentSort: SiteContentSortOption;
	statusFilters: SiteContentStatusFilters;
	toggleStatusFilter: ( filter: SiteContentSelectableStatus ) => void;
	unregisterSection: ( type: Slug ) => void;
};

const ContentPanelCoordinatorContext = createContext< ContentPanelCoordinatorValue | null >( null );

export function ContentPanelCoordinatorProvider( { children }: { children: ReactNode } ) {
	const sectionsRef = useRef( new Map< Slug, SectionHandlers >() );
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ siteContentSort, setSiteContentSortState ] = useState< SiteContentSortOption >( DEFAULT_SITE_CONTENT_SORT );
	const [ statusFilters, setStatusFilters ] = useState< SiteContentStatusFilters >(
		EMPTY_SITE_CONTENT_STATUS_FILTERS
	);

	const registerSection = useCallback( ( type: Slug, handlers: SectionHandlers ) => {
		sectionsRef.current.set( type, handlers );
	}, [] );

	const unregisterSection = useCallback( ( type: Slug ) => {
		sectionsRef.current.delete( type );
	}, [] );

	const requestCreate = useCallback( ( type: Slug ) => {
		const handlers = sectionsRef.current.get( type );

		if ( ! handlers ) {
			return;
		}

		handlers.setExpanded( true );
		handlers.startCreate();
	}, [] );

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

	const value = useMemo(
		() => ( {
			clearActiveToolbarFilters,
			clearSiteContentSort,
			clearStatusFilters,
			registerSection,
			requestCreate,
			searchQuery,
			setSearchQuery,
			setSiteContentSort,
			siteContentSort,
			statusFilters,
			toggleStatusFilter,
			unregisterSection,
		} ),
		[
			clearActiveToolbarFilters,
			clearSiteContentSort,
			clearStatusFilters,
			registerSection,
			requestCreate,
			searchQuery,
			siteContentSort,
			setSiteContentSort,
			statusFilters,
			toggleStatusFilter,
			unregisterSection,
		]
	);

	return (
		<ContentPanelCoordinatorContext.Provider value={ value }>{ children }</ContentPanelCoordinatorContext.Provider>
	);
}

export function useContentPanelCoordinator() {
	const context = useContext( ContentPanelCoordinatorContext );

	if ( ! context ) {
		throw new Error(
			'The `useContentPanelCoordinator()` hook must be used within a `<ContentPanelCoordinatorProvider />`'
		);
	}

	return context;
}
