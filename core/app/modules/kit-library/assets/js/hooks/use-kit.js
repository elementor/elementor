import { useQuery, useQueryClient } from 'react-query';
import Kit from '../models/kit';
import { KEY as LIST_KEY } from './use-kits';
import useTags from './use-tags';

export const KEY = 'kit';

const { useMemo, useCallback } = React;

export default function useKit( id ) {
	const parsedId = useMemo( () => parseInt( id ), [ id ] );
	const placeholderDataCallback = usePlaceholderDataCallback( parsedId );

	const tagsQuery = useTags();
	const kitQuery = useQuery( [ KEY, parsedId ], fetchKitItem, {
			placeholderData: placeholderDataCallback,
		}
	);

	const data = useMemo( () => {
		const kit = kitQuery.data;

		if ( kit && tagsQuery.data?.length > 0 ) {
			kit.transformRawTagsIntoTags( tagsQuery.data );
		}

		return kit;
	}, [ kitQuery.data, tagsQuery.data ] );

	return {
		...kitQuery,
		data,
	};
}

/**
 * Return placeholder function for kit query.
 *
 * @param id
 * @returns {function(): (undefined|*)}
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
 * @param key
 * @param id
 * @returns {Promise<Kit>}
 */
function fetchKitItem( { queryKey: [ key, id ] } ) {
	return $e.data.get( 'kits/index', { id }, { refresh: true } )
		.then( ( response ) => response.data )
		.then( ( { data } ) => Kit.createFromResponse( data ) );
}
