import { __ } from '@wordpress/i18n';

export type SiteContentStatusFilter = 'all' | 'draft' | 'publish' | 'trash';

export const SITE_CONTENT_STATUS_FILTERS: SiteContentStatusFilter[] = [ 'all', 'publish', 'draft', 'trash' ];

const filterLabels: Record< SiteContentStatusFilter, string > = {
	all: __( 'All', 'elementor' ),
	publish: __( 'Published', 'elementor' ),
	draft: __( 'Drafts', 'elementor' ),
	trash: __( 'Trash', 'elementor' ),
};

export function getSiteContentStatusFilterLabel( filter: SiteContentStatusFilter ): string {
	return filterLabels[ filter ];
}

export function getRestStatusForSiteContentFilter( filter: SiteContentStatusFilter ): string {
	if ( 'all' === filter ) {
		return 'any';
	}

	return filter;
}

export function isSiteContentListNarrowed(
	statusFilter: SiteContentStatusFilter,
	search: string
): boolean {
	return 'all' !== statusFilter || search.trim().length > 0;
}