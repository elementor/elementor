import { useQuery } from 'react-query';
import Kit from '../models/kit';
import { taxonomyType } from '../models/taxonomy';

export const KEY = 'kits';

const { useState, useMemo, useCallback } = React;

const initiateFilterState = {
	search: '',
	taxonomies: taxonomyType.reduce( ( current, { key } ) => {
		return {
			...current,
			[ key ]: [],
		};
	}, {} ),
};

export default function useKits() {
	const [ filter, setFilter ] = useState( initiateFilterState );

	const clearFilter = useCallback( () => {
		setFilter( { ...initiateFilterState } );
	}, [ setFilter ] );

	const query = useQuery( [ KEY ], fetchKits );

	const data = useFilteredData( query.data, filter );

	return {
		...query,
		data,
		filter,
		setFilter,
		clearFilter,
	};
}

function useFilteredData( data, filter ) {
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

		return filteredData;
	}, [ data, filter ] );
}

function fetchKits() {
	return $e.data.get( 'kits/index', {}, { refresh: true } )
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
