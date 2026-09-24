import { useQuery } from '@elementor/query';

import { type FontAwesome7Icon, loadFontAwesome7Catalog } from './font-awesome-7-catalog';

const FONT_AWESOME_7_CATALOG_QUERY_KEY = [ 'font-awesome-7-catalog' ];

export function useFontAwesome7Catalog( enabled: boolean ) {
	return useQuery< FontAwesome7Icon[] >( {
		queryKey: FONT_AWESOME_7_CATALOG_QUERY_KEY,
		queryFn: ( { signal } ) => loadFontAwesome7Catalog( signal ),
		enabled,
		staleTime: Infinity,
	} );
}
