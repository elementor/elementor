import * as React from 'react';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import useAccessiblePanelPostTypes from '../hooks/use-accessible-panel-post-types';
import {
	getSiteContentPanelSectionDescriptors,
	hasHiddenSiteContentPanelSections,
	type SiteContentPanelSectionDescriptor,
} from '../site-content-panel-sections';

type SiteContentPanelSectionsFilterContextValue = {
	clearHiddenSections: () => void;
	descriptors: SiteContentPanelSectionDescriptor[];
	hasHiddenSections: boolean;
	hiddenSectionIds: ReadonlySet< string >;
	isSectionVisible: ( sectionId: string ) => boolean;
	setSectionVisible: ( sectionId: string, visible: boolean ) => void;
	shouldShowSectionsFilter: boolean;
};

const SiteContentPanelSectionsFilterContext = createContext< SiteContentPanelSectionsFilterContextValue | null >(
	null
);

export function SiteContentPanelSectionsFilterProvider( { children }: { children: ReactNode } ) {
	const { accessiblePostTypes } = useAccessiblePanelPostTypes();
	const descriptors = useMemo(
		() => getSiteContentPanelSectionDescriptors( accessiblePostTypes ),
		[ accessiblePostTypes ]
	);
	const [ hiddenSectionIds, setHiddenSectionIds ] = useState< ReadonlySet< string > >( () => new Set() );

	useEffect( () => {
		const validIds = new Set( descriptors.map( ( descriptor ) => descriptor.id ) );

		setHiddenSectionIds( ( current ) => {
			const nextHidden = new Set( [ ...current ].filter( ( id ) => validIds.has( id ) ) );

			return nextHidden.size === current.size ? current : nextHidden;
		} );
	}, [ descriptors ] );

	const setSectionVisible = useCallback(
		( sectionId: string, visible: boolean ) => {
			setHiddenSectionIds( ( current ) => {
				if ( visible ) {
					if ( ! current.has( sectionId ) ) {
						return current;
					}

					const next = new Set( current );
					next.delete( sectionId );

					return next;
				}

				const visibleSectionCount = descriptors.length - current.size;

				if ( current.has( sectionId ) || visibleSectionCount <= 1 ) {
					return current;
				}

				const next = new Set( current );
				next.add( sectionId );

				return next;
			} );
		},
		[ descriptors.length ]
	);

	const isSectionVisible = useCallback(
		( sectionId: string ) => ! hiddenSectionIds.has( sectionId ),
		[ hiddenSectionIds ]
	);

	const clearHiddenSections = useCallback( () => {
		setHiddenSectionIds( () => new Set() );
	}, [] );

	const value = useMemo(
		() => ( {
			clearHiddenSections,
			descriptors,
			hasHiddenSections: hasHiddenSiteContentPanelSections( hiddenSectionIds ),
			hiddenSectionIds,
			isSectionVisible,
			setSectionVisible,
			shouldShowSectionsFilter: descriptors.length > 1,
		} ),
		[ clearHiddenSections, descriptors, hiddenSectionIds, isSectionVisible, setSectionVisible ]
	);

	return (
		<SiteContentPanelSectionsFilterContext.Provider value={ value }>
			{ children }
		</SiteContentPanelSectionsFilterContext.Provider>
	);
}

export function useSiteContentPanelSectionsFilter() {
	const context = useContext( SiteContentPanelSectionsFilterContext );

	if ( ! context ) {
		throw new Error(
			'useSiteContentPanelSectionsFilter() must be used within a SiteContentPanelSectionsFilterProvider'
		);
	}

	return context;
}
