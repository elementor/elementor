import { __ } from '@wordpress/i18n';

import { isSiteContentListNarrowed, type SiteContentStatusFilters } from './site-content-status-filter';

export type SiteContentSortOption = 'newest' | 'oldest';

export const SITE_CONTENT_SORT_OPTIONS: SiteContentSortOption[] = [ 'oldest', 'newest' ];

export const DEFAULT_SITE_CONTENT_SORT: SiteContentSortOption = 'oldest';

export const SITE_CONTENT_SORT_POPOVER_WIDTH_PX = 280;

export type SiteContentRestListOrder = {
	order: 'asc' | 'desc';
	orderby: 'date';
};

const sortLabels: Record< SiteContentSortOption, string > = {
	oldest: __( 'Oldest', 'elementor' ),
	newest: __( 'Newest', 'elementor' ),
};

export function getSiteContentSortLabel( sort: SiteContentSortOption ): string {
	return sortLabels[ sort ];
}

export function hasActiveSiteContentSort( sort: SiteContentSortOption ): boolean {
	return sort !== DEFAULT_SITE_CONTENT_SORT;
}

export function isSiteContentListRefinedByToolbar(
	statusFilters: SiteContentStatusFilters,
	search: string,
	sort: SiteContentSortOption
): boolean {
	return isSiteContentListNarrowed( statusFilters, search ) || hasActiveSiteContentSort( sort );
}

export function getRestOrderForSiteContentSort( sort: SiteContentSortOption ): SiteContentRestListOrder {
	if ( sort === 'newest' ) {
		return { order: 'desc', orderby: 'date' };
	}

	return { order: 'asc', orderby: 'date' };
}

export function shouldPinHomepageForSiteContentSort( sort: SiteContentSortOption ): boolean {
	return sort === DEFAULT_SITE_CONTENT_SORT;
}