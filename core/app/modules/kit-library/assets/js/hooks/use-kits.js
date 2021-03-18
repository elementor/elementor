import { useQuery } from 'react-query';
import Kit from '../models/kit';

export const KEY = 'kits';

const { useState, useMemo } = React;

export default function useKits() {
	const [ filter, setFilter ] = useState( {
		search: '',
	} );

	const isFilterActive = useMemo( () => filter.search, [ filter ] );

	const query = useQuery( [ KEY ], fetchKits );

	const data = useFilteredData( query.data, filter );

	return {
		...query,
		data,
		filter,
		setFilter,
		isFilterActive,
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

	return keywords.some( ( keyword ) => keyword.includes( searchTerm ) );
}
