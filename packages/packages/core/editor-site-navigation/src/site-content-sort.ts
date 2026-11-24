import { __ } from '@wordpress/i18n';

export type SiteContentSortOption = 'edited' | 'newest' | 'oldest';

export const SITE_CONTENT_SORT_OPTIONS: SiteContentSortOption[] = [ 'oldest', 'newest', 'edited' ];

export const DEFAULT_SITE_CONTENT_SORT: SiteContentSortOption = 'oldest';

export const SITE_CONTENT_SORT_POPOVER_WIDTH_PX = 280;

export type SiteContentRestListOrder = {
	order: 'asc' | 'desc';
	orderby: 'date' | 'modified';
};

const sortLabels: Record< SiteContentSortOption, string > = {
	oldest: __( 'Oldest', 'elementor' ),
	newest: __( 'Newest', 'elementor' ),
	edited: __( 'Edited', 'elementor' ),
};

export function getSiteContentSortLabel( sort: SiteContentSortOption ): string {
	return sortLabels[ sort ];
}

export function hasActiveSiteContentSort( sort: SiteContentSortOption ): boolean {
	return sort !== DEFAULT_SITE_CONTENT_SORT;
}

export function getRestOrderForSiteContentSort( sort: SiteContentSortOption ): SiteContentRestListOrder {
	switch ( sort ) {
		case 'newest':
			return { order: 'desc', orderby: 'date' };
		case 'edited':
			return { order: 'desc', orderby: 'modified' };
		default:
			return { order: 'asc', orderby: 'date' };
	}
}

export function shouldPinHomepageForSiteContentSort( sort: SiteContentSortOption ): boolean {
	return sort === DEFAULT_SITE_CONTENT_SORT;
}
