import * as React from 'react';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { type Slug } from '../api/post';
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
	clearStatusFilters: () => void;
	registerSection: ( type: Slug, handlers: SectionHandlers ) => void;
	requestCreate: ( type: Slug ) => void;
	searchQuery: string;
	setSearchQuery: ( query: string ) => void;
	statusFilters: SiteContentStatusFilters;
	toggleStatusFilter: ( filter: SiteContentSelectableStatus ) => void;
	unregisterSection: ( type: Slug ) => void;
};

const ContentPanelCoordinatorContext = createContext< ContentPanelCoordinatorValue | null >( null );

export function ContentPanelCoordinatorProvider( { children }: { children: ReactNode } ) {
	const sectionsRef = useRef( new Map< Slug, SectionHandlers >() );
	const [ searchQuery, setSearchQuery ] = useState( '' );
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

	const clearStatusFilters = useCallback( () => {
		setStatusFilters( EMPTY_SITE_CONTENT_STATUS_FILTERS );
	}, [] );

	const toggleStatusFilter = useCallback( ( filter: SiteContentSelectableStatus ) => {
		setStatusFilters( ( current ) => toggleSiteContentStatusFilter( current, filter ) );
	}, [] );

	const value = useMemo(
		() => ( {
			clearStatusFilters,
			registerSection,
			requestCreate,
			searchQuery,
			setSearchQuery,
			statusFilters,
			toggleStatusFilter,
			unregisterSection,
		} ),
		[
			clearStatusFilters,
			registerSection,
			requestCreate,
			searchQuery,
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
