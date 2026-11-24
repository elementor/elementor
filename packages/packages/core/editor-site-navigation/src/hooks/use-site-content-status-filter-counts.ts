import { useQuery } from '@elementor/query';

import { fetchPostsTotal, type Slug } from '../api/post';
import {
	SITE_CONTENT_SELECTABLE_STATUS_FILTERS,
	type SiteContentSelectableStatus,
} from '../site-content-status-filter';

const STATUS_FILTER_COUNTS_STALE_TIME_MS = 30 * 1000;

export const siteContentStatusFilterCountsQueryKeyBase = [ 'site-navigation', 'status-filter-counts' ];

export const siteContentStatusFilterCountsQueryKey = ( postTypes: Slug[] ) => [
	...siteContentStatusFilterCountsQueryKeyBase,
	postTypes.join( ',' ),
];

const sumFulfilledTotals = ( results: PromiseSettledResult< number >[] ): number | undefined => {
	const fulfilled = results.filter(
		( result ): result is PromiseFulfilledResult< number > => 'fulfilled' === result.status
	);

	if ( fulfilled.length !== results.length ) {
		return undefined;
	}

	return fulfilled.reduce( ( sum, result ) => sum + result.value, 0 );
};

const fetchStatusFilterCounts = async (
	postTypes: Slug[]
): Promise< Partial< Record< SiteContentSelectableStatus, number > > > => {
	const entries = await Promise.all(
		SITE_CONTENT_SELECTABLE_STATUS_FILTERS.map( async ( status ) => {
			const results = await Promise.allSettled( postTypes.map( ( slug ) => fetchPostsTotal( slug, status ) ) );
			const total = sumFulfilledTotals( results );

			if ( undefined === total ) {
				return null;
			}

			return [ status, total ] as const;
		} )
	);

	return Object.fromEntries( entries.filter( ( entry ) => null !== entry ) );
};

export function useSiteContentStatusFilterCounts( postTypes: Slug[], enabled: boolean ) {
	return useQuery( {
		enabled: enabled && postTypes.length > 0,
		queryFn: () => fetchStatusFilterCounts( postTypes ),
		queryKey: siteContentStatusFilterCountsQueryKey( postTypes ),
		staleTime: STATUS_FILTER_COUNTS_STALE_TIME_MS,
	} );
}
