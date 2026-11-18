import * as React from 'react';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { type Slug } from '../api/post';

type SectionHandlers = {
	setExpanded: ( expanded: boolean ) => void;
	startCreate: () => void;
};

type ContentPanelCoordinatorValue = {
	registerSection: ( type: Slug, handlers: SectionHandlers ) => void;
	unregisterSection: ( type: Slug ) => void;
	requestCreate: ( type: Slug ) => void;
	searchQuery: string;
	setSearchQuery: ( query: string ) => void;
};

const ContentPanelCoordinatorContext = createContext< ContentPanelCoordinatorValue | null >( null );

export function ContentPanelCoordinatorProvider( { children }: { children: ReactNode } ) {
	const sectionsRef = useRef( new Map< Slug, SectionHandlers >() );
	const [ searchQuery, setSearchQuery ] = useState( '' );

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

	const value = useMemo(
		() => ( {
			registerSection,
			unregisterSection,
			requestCreate,
			searchQuery,
			setSearchQuery,
		} ),
		[ registerSection, unregisterSection, requestCreate, searchQuery ]
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
