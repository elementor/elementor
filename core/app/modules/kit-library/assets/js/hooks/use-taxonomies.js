import { useQuery } from 'react-query';
import Taxonomy from '../models/taxonomy';

export const KEY = 'tags';

export default function useTaxonomies() {
	return useQuery( [ KEY ], fetchTaxonomies );
}

function fetchTaxonomies() {
	return $e.data.get( 'kit-taxonomies/index', {}, { refresh: true } )
		.then( ( response ) => response.data )
		.then( ( { data } ) => data.map( ( taxonomy ) => Taxonomy.createFromResponse( taxonomy ) ) );
}
