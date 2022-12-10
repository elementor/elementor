import Kit from '../models/kit';
import { KEY as LIST_KEY } from './use-kits';
import { useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';

export const KEY = 'kit';

export default function useKit( id ) {
	// A function that returns existing data from the kit list for a placeholder data before the kit request will resolved.
	const placeholderDataCallback = usePlaceholderDataCallback( id );

	return useQuery( [ KEY, id ], fetchKitItem, {
			placeholderData: placeholderDataCallback,
		},
	);
}

/**
 * Return placeholder function for kit query.
 *
 * @param {*} id
 * @return {function(): (undefined|*)} placeholder
 */
function usePlaceholderDataCallback( id ) {
	const queryClient = useQueryClient();

	return useCallback( () => {
		const placeholder = queryClient.getQueryData( LIST_KEY )
			?.find( ( kit ) => {
				return kit.id === id;
			} );

		if ( ! placeholder ) {
			return;
		}

		return placeholder;
	}, [ queryClient, id ] );
}

/**
 * Fetch kit
 *
 * @param {Object} root0
 * @param {Object} root0.queryKey
 * @param {*}      root0.queryKey.0
 * @param {string} root0.queryKey.1
 * @return {Promise<Kit>} kit
 */
// eslint-disable-next-line no-unused-vars
function fetchKitItem( { queryKey: [ _, id ] } ) {
	return $e.data.get( 'kits/index', { id }, { refresh: true } )
		.then( ( response ) => response.data )
		.then( ( { data } ) => Kit.createFromResponse( data ) );
}
