import * as React from 'react';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef } from 'react';

import { type Slug } from '../api/post';

export type ContentPanelSectionId = Slug | ( string & {} );

type SectionHandlers = {
	setExpanded: ( expanded: boolean ) => void;
	startCreate: () => void;
};

type ContentPanelCoordinatorValue = {
	registerSection: ( type: ContentPanelSectionId, handlers: SectionHandlers ) => void;
	requestCreate: ( type: ContentPanelSectionId ) => void;
	unregisterSection: ( type: ContentPanelSectionId ) => void;
};

const ContentPanelCoordinatorContext = createContext< ContentPanelCoordinatorValue | null >( null );

export function ContentPanelCoordinatorProvider( { children }: { children: ReactNode } ) {
	const sectionsRef = useRef( new Map< ContentPanelSectionId, SectionHandlers >() );

	const registerSection = useCallback( ( type: ContentPanelSectionId, handlers: SectionHandlers ) => {
		sectionsRef.current.set( type, handlers );
	}, [] );

	const unregisterSection = useCallback( ( type: ContentPanelSectionId ) => {
		sectionsRef.current.delete( type );
	}, [] );

	const requestCreate = useCallback( ( type: ContentPanelSectionId ) => {
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
			requestCreate,
			unregisterSection,
		} ),
		[ registerSection, requestCreate, unregisterSection ]
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
