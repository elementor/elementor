import { __ } from '@wordpress/i18n';

export type SiteContentSelectableStatus = 'draft' | 'future' | 'pending' | 'private' | 'publish' | 'trash';

export type SiteContentStatusFilters = Record< SiteContentSelectableStatus, boolean >;

export const SITE_CONTENT_SELECTABLE_STATUS_FILTERS: SiteContentSelectableStatus[] = [
	'publish',
	'draft',
	'pending',
	'private',
	'future',
	'trash',
];

export const EMPTY_SITE_CONTENT_STATUS_FILTERS: SiteContentStatusFilters = {
	draft: false,
	future: false,
	pending: false,
	private: false,
	publish: false,
	trash: false,
};

const filterLabels: Record< SiteContentSelectableStatus, string > = {
	publish: __( 'Published', 'elementor' ),
	draft: __( 'Drafts', 'elementor' ),
	pending: __( 'Pending', 'elementor' ),
	private: __( 'Private', 'elementor' ),
	future: __( 'Scheduled', 'elementor' ),
	trash: __( 'Trash', 'elementor' ),
};

export const SITE_CONTENT_ALL_FILTER_LABEL = __( 'All', 'elementor' );

export const SITE_CONTENT_FILTER_POPOVER_WIDTH_PX = 280;

export function getSiteContentStatusFilterLabel( filter: SiteContentSelectableStatus ): string {
	return filterLabels[ filter ];
}

export function hasActiveSiteContentStatusFilters( filters: SiteContentStatusFilters ): boolean {
	return SITE_CONTENT_SELECTABLE_STATUS_FILTERS.some( ( key ) => filters[ key ] );
}

export function getActiveSiteContentStatusFilterKeys(
	filters: SiteContentStatusFilters
): SiteContentSelectableStatus[] {
	return SITE_CONTENT_SELECTABLE_STATUS_FILTERS.filter( ( key ) => filters[ key ] );
}

export const serializeSiteContentStatusFilters = ( statusFilters: SiteContentStatusFilters ): string =>
	SITE_CONTENT_SELECTABLE_STATUS_FILTERS.map( ( key ) => ( statusFilters[ key ] ? key : '' ) ).join( '|' );

export function getRestStatusForSiteContentFilters( filters: SiteContentStatusFilters ): string {
	if ( filters.trash ) {
		return 'trash';
	}

	const active = getActiveSiteContentStatusFilterKeys( filters );

	if ( 0 === active.length ) {
		return 'any';
	}

	return active.join( ',' );
}

export function isSiteContentTrashFilterActive( filters: SiteContentStatusFilters ): boolean {
	return filters.trash;
}

export function isSiteContentListNarrowed( filters: SiteContentStatusFilters, search: string ): boolean {
	return hasActiveSiteContentStatusFilters( filters ) || search.trim().length > 0;
}

export function toggleSiteContentStatusFilter(
	filters: SiteContentStatusFilters,
	filter: SiteContentSelectableStatus
): SiteContentStatusFilters {
	if ( 'trash' === filter ) {
		const isTrashOn = ! filters.trash;

		return {
			...EMPTY_SITE_CONTENT_STATUS_FILTERS,
			trash: isTrashOn,
		};
	}

	return {
		...filters,
		trash: false,
		[ filter ]: ! filters[ filter ],
	};
}

export function shouldShowSiteContentStatusFilterRow(
	count: number | undefined,
	isLoadingCounts: boolean,
	isSelected: boolean
): boolean {
	if ( isSelected ) {
		return true;
	}

	if ( isLoadingCounts || undefined === count ) {
		return false;
	}

	return count > 0;
}
