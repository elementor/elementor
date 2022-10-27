import Kit from '../models/kit';
import useSelectedTaxonomies from './use-selected-taxonomies';
import { taxonomyType } from '../models/taxonomy';
import { useQuery } from 'react-query';
import { useState, useMemo, useCallback, useEffect } from 'react';

export const KEY = 'kits';

/**
 * The default query params
 *
 * @type {Object}
 */
export const defaultQueryParams = {
	favorite: false,
	search: '',
	taxonomies: taxonomyType.reduce( ( current, { key } ) => {
		return {
			...current,
			[ key ]: [],
		};
	}, {} ),
	order: {
		direction: 'asc',
		by: 'featuredIndex',
	},
	referrer: null,
};

const kitsPipeFunctions = {
	/**
	 * Filter by favorite
	 *
	 * @param {Array<*>} data
	 * @param {*}        queryParams
	 * @return {Array} filtered data
	 */
	favoriteFilter: ( data, queryParams ) => {
		if ( ! queryParams.favorite ) {
			return data;
		}

		return data.filter( ( item ) => item.isFavorite );
	},

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
			const keywords = [ ...item.keywords, ...item.taxonomies, item.title ];
			const searchTerm = queryParams.search.toLowerCase();

			return keywords.some( ( keyword ) => keyword.toLowerCase().includes( searchTerm ) );
		} );
	},

	/**
	 * Filter by taxonomies.
	 * In each taxonomy type it use the OR operator and between types it uses the AND operator.
	 *
	 * @param {Array<*>} data
	 * @param {*}        queryParams
	 * @return {Array} filtered data
	 */
	taxonomiesFilter: ( data, queryParams ) => {
		return Object.values( queryParams.taxonomies )
			.filter( ( taxonomies ) => taxonomies.length )
			.reduce( ( current, taxonomies ) => current.filter( ( item ) =>
				taxonomies.some( ( taxonomy ) =>
					item.taxonomies.some( ( itemTaxonomy ) => taxonomy === itemTaxonomy ),
				) ),
				data,
			);
	},

	/**
	 * Sort all the data by the "order" query param
	 *
	 * @param {Array<*>} data
	 * @param {*}        queryParams
	 * @return {Array} sorted data
	 */
	sort: ( data, queryParams ) => {
		const order = queryParams.order;

		return data.sort( ( item1, item2 ) => {
			if ( 'asc' === order.direction ) {
				return item1[ order.by ] - item2[ order.by ];
			}

			return item2[ order.by ] - item1[ order.by ];
		} );
	},
};

/**
 * A util function to transform data throw transform functions
 *
 * @param {Array<Function>} functions
 * @return {function(*=, ...[*]): *} function
 */
function pipe( ...functions ) {
	return ( value, ...args ) =>
		functions.reduce(
			( currentValue, currentFunction ) => currentFunction( currentValue, ...args ),
			value,
		);
}

/**
 * Fetch kits
 *
 * @param {boolean} force
 * @return {*} kits
 */
function fetchKits( force ) {
	return $e.data.get( 'kits/index', {
		force: force ? 1 : undefined,
	}, { refresh: true } )
		.then( ( response ) => response.data )
		.then( ( { data } ) => data.map( ( item ) => Kit.createFromResponse( item ) ) );
}

/**
 * Main function.
 *
 * @param {*} initialQueryParams
 * @return {Object} query
 */
export default function useKits( initialQueryParams = {} ) {
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

	const selectedTaxonomies = useSelectedTaxonomies( queryParams.taxonomies );

	const isFilterActive = useMemo(
		() => !! queryParams.search || !! selectedTaxonomies.length,
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
