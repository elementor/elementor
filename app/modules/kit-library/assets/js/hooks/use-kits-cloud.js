import Kit from '../models/kit';
import { useQuery } from 'react-query';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { pipe } from '../utils';

export const KEY = 'kits-cloud';

/**
 * The default query params
 *
 * @type {Object}
 */
export const defaultQueryParams = {
	search: '',
	referrer: null,
};

const kitsPipeFunctions = {
	/**
	 * Filter by search term.
	 *
	 * @param {Array<*>} data
	 * @param {*}        queryParams
	 * @return {Array} filtered data
	 */
	searchFilter: ( data, queryParams ) => {
		if ( ! queryParams.search ) {
			return data;
		}

		return data.filter( ( item ) => {
			const keywords = [ item.title ];
			const searchTerm = queryParams.search.toLowerCase();

			return keywords.some( ( keyword ) => keyword.toLowerCase().includes( searchTerm ) );
		} );
	},
};

/**
 * Fetch kits
 *
 * @return {*} kits
 */
function fetchKits() {
	return $e.data.get( 'kits-cloud/index', {}, { refresh: true } )
		.then( ( response ) => response.data )
		.then( ( { data } ) => data.map( ( item ) => Kit.createFromResponse( item ) ) );
}

/**
 * Main function.
 *
 * @param {*} initialQueryParams
 * @return {Object} query
 */
export default function useKitsCloud( initialQueryParams = {} ) {
	const [ force, setForce ] = useState( false );
	const [ queryParams, setQueryParams ] = useState( () => ( {
		ready: false, // When the query param is ready to use (after parsing and assign the query param from the url)
		...defaultQueryParams,
		...initialQueryParams,
	} ) );

	const forceRefetch = useCallback( () => setForce( true ), [ setForce ] );

	const clearQueryParams = useCallback(
		() => setQueryParams( { ready: true, ...defaultQueryParams, ...initialQueryParams } ),
		[ setQueryParams ],
	);

	const query = useQuery( [ KEY ], () => fetchKits( force ) );

	const data = useMemo(
		() => ! query.data
			? []
			: pipe( ...Object.values( kitsPipeFunctions ) )( [ ...query.data ], queryParams ),
		[ query.data, queryParams ],
	);

	const isFilterActive = useMemo(
		() => !! queryParams.search,
		[ queryParams ],
	);

	useEffect( () => {
		if ( ! force ) {
			return;
		}

		query.refetch().then( () => setForce( false ) );
	}, [ force ] );

	return {
		...query,
		data,
		queryParams,
		setQueryParams,
		clearQueryParams,
		forceRefetch,
		isFilterActive,
	};
}
