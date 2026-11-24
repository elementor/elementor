import { useQuery } from '@elementor/query';

import { fetchPostsTotal, type Slug } from '../api/post';
import {
	SITE_CONTENT_SELECTABLE_STATUS_FILTERS,
	type SiteContentSelectableStatus,
} from '../site-content-status-filter';

export const siteContentStatusFilterCountsQueryKey = ( postTypes: Slug[] ) => [
	'site-navigation',
	'status-filter-counts',
	postTypes.join( ',' ),
];

const fetchStatusFilterCounts = async (
	postTypes: Slug[]
): Promise< Record< SiteContentSelectableStatus, number > > => {
	const entries = await Promise.all(
		SITE_CONTENT_SELECTABLE_STATUS_FILTERS.map( async ( status ) => {
			const totals = await Promise.all( postTypes.map( ( slug ) => fetchPostsTotal( slug, status ) ) );

			return [ status, totals.reduce( ( sum, count ) => sum + count, 0 ) ] as const;
		} )
	);

	return Object.fromEntries( entries ) as Record< SiteContentSelectableStatus, number >;
};

export function useSiteContentStatusFilterCounts( postTypes: Slug[], enabled: boolean ) {
	return useQuery( {
		enabled: enabled && postTypes.length > 0,
		queryFn: () => fetchStatusFilterCounts( postTypes ),
		queryKey: siteContentStatusFilterCountsQueryKey( postTypes ),
	} );
}
