import { useQuery } from 'react-query';
import Kit from '../models/kit';

export const KEY = 'kits';

export default function useKits() {
	return useQuery( [ KEY ], fetchKits );
}

function fetchKits() {
	return $e.data.get( 'kits/index', {}, { refresh: true } )
		.then( ( response ) => response.data )
		.then( ( { data } ) => data.map( ( item ) => Kit.createFromResponse( item ) ) );
}
