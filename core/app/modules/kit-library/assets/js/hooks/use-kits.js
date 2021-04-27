import Kit from '../models/kit';
import { taxonomyType } from '../models/taxonomy';
import { useQuery } from 'react-query';

export const KEY = 'kits';

const { useState, useMemo, useCallback, useEffect } = React;

const initiateFilterState = {
	search: '',
	taxonomies: taxonomyType.reduce( ( current, { key } ) => {
		return {
			...current,
			[ key ]: [],
		};
	}, {} ),
};

const initialSortState = {
	direction: 'desc',
	by: 'createdAt',
};

export default function useKits() {
	const [ force, setForce ] = useState( false );
	const [ filter, setFilter ] = useState( initiateFilterState );
	const [ sort, setSort ] = useState( initialSortState );

	const forceRefetch = useCallback( () => setForce( true ), [ setForce ] );
	const clearFilter = useCallback( () => setFilter( { ...initiateFilterState } ), [ setFilter ] );

	const query = useQuery( [ KEY ], () => fetchKits( force ) );

	const data = useFilteredData( query.data, filter, sort );

	useEffect( () => {
		if ( ! force ) {
			return;
		}

		query.refetch().then( () => setForce( false ) );
	}, [ force ] );

	return {
		...query,
		data,
		filter,
		setFilter,
		clearFilter,
		sort,
		setSort,
		forceRefetch,
	};
}

function useFilteredData( data, filter, sort ) {
	return useMemo( () => {
		if ( ! data ) {
			return [];
		}

		let filteredData = [ ...data ];

		if ( filter.search ) {
			filteredData = filteredData.filter( ( item ) => searchFilter( item, filter.search ) );
		}

		taxonomyType.forEach( ( { key } ) => {
			if ( filter.taxonomies[ key ]?.length > 0 ) {
				filteredData = filteredData.filter( ( item ) => taxonomiesFilter( item, filter.taxonomies[ key ] ) );
			}
		} );

		filteredData.sort( ( item, item2 ) => {
			if ( 'asc' === sort.direction ) {
				return item[ sort.by ] - item2[ sort.by ];
			}

			return item2[ sort.by ] - item[ sort.by ];
		} );

		return filteredData;
	}, [ data, filter, sort ] );
}

function fetchKits( force ) {
	return $e.data.get( 'kits/index', {
		force: force ? 1 : undefined,
	}, { refresh: true } )
		.then( ( response ) => response.data )
		.then( ( { data } ) => data.map( ( item ) => Kit.createFromResponse( item ) ) );
}

function searchFilter( item, searchTerm ) {
	const keywords = [ ...item.keywords, item.title ];

	searchTerm = searchTerm.toLowerCase();

	return keywords.some( ( keyword ) => keyword.toLowerCase().includes( searchTerm ) );
}

function taxonomiesFilter( item, taxonomies ) {
	return taxonomies.some( ( taxonomy ) =>
		item.taxonomies.some( ( itemTaxonomy ) => taxonomy === itemTaxonomy )
	);
}
