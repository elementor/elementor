import * as React from 'react';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

import { type Slug } from '../api/post';
import {
	type SiteContentSectionListControls,
	useSiteContentSectionListControls,
} from '../hooks/use-site-content-section-list-controls';
import { type SiteContentSelectableStatus } from '../site-content-status-filter';

type SiteContentSectionToolbarContextValue = SiteContentSectionListControls & {
	statusFilterCountSlugs: Slug[];
	statusFilterCounts?: Partial< Record< SiteContentSelectableStatus, number > >;
	statusFilterCountsPending?: boolean;
};

const SiteContentSectionToolbarContext = createContext< SiteContentSectionToolbarContextValue | null >( null );

type ProviderProps = {
	children: ReactNode;
	statusFilterCountSlugs?: Slug[];
	statusFilterCounts?: Partial< Record< SiteContentSelectableStatus, number > >;
	statusFilterCountsPending?: boolean;
};

export function SiteContentSectionToolbarProvider( {
	children,
	statusFilterCountSlugs = [],
	statusFilterCounts,
	statusFilterCountsPending = false,
}: ProviderProps ) {
	const controls = useSiteContentSectionListControls();

	const value = useMemo(
		() => ( {
			...controls,
			statusFilterCountSlugs,
			statusFilterCounts,
			statusFilterCountsPending,
		} ),
		[ controls, statusFilterCountSlugs, statusFilterCounts, statusFilterCountsPending ]
	);

	return (
		<SiteContentSectionToolbarContext.Provider value={ value }>
			{ children }
		</SiteContentSectionToolbarContext.Provider>
	);
}

export function useSiteContentSectionToolbar() {
	const context = useContext( SiteContentSectionToolbarContext );

	if ( ! context ) {
		throw new Error(
			'The `useSiteContentSectionToolbar()` hook must be used within a `<SiteContentSectionToolbarProvider />`'
		);
	}

	return context;
}
