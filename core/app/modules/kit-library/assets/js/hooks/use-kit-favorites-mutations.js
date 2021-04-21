import Kit from '../models/kit';
import { useCallback } from 'react';
import { KEY as kitsKey } from '../hooks/use-kits';
import { KEY as kitKey } from '../hooks/use-kit';
import { useMutation, useQueryClient } from 'react-query';

export function useKitFavoritesMutations() {
	const queryClient = useQueryClient();

	const onSuccess = useCallback( ( { data } ) => {
		const kit = Kit.createFromResponse( data.data );

		if ( queryClient.getQueryData( [ kitsKey ] ) ) {
			queryClient.setQueryData(
				[ kitsKey ],
				( kits ) => {
					if ( ! kits ) {
						return kits;
					}

					return kits.map( ( item ) => item.id === kit.id ? kit : item );
				}
			);
		}

		queryClient.invalidateQueries( [ kitKey, data.data.id ] );
	}, [ queryClient ] );

	const addToFavorites = useMutation(
		( id ) => $e.data.create( 'kits/favorites', {}, { id } ),
		{ onSuccess }
	);
	const removeFromFavorites = useMutation(
		( id ) => $e.data.delete( 'kits/favorites', { id } ),
		{ onSuccess }
	);

	return {
		addToFavorites,
		removeFromFavorites,
		isLoading: addToFavorites.isLoading || removeFromFavorites.isLoading,
	};
}
