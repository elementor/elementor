import Kit from '../models/kit';
import { useCallback } from 'react';
import { KEY as kitsKey } from '../hooks/use-kits';
import { KEY as kitKey } from '../hooks/use-kit';
import { useMutation, useQueryClient } from 'react-query';

export function useKitFavoritesMutations() {
	const queryClient = useQueryClient();

	const onSuccess = useCallback( ( { data } ) => {
		const id = data.data.id;
		const isFavorite = data.data.is_favorite;

		// Update the kit list if the list exists.
		if ( queryClient.getQueryData( [ kitsKey ] ) ) {
			queryClient.setQueryData(
				[ kitsKey ],
				( kits ) => {
					if ( ! kits ) {
						return kits;
					}

					const currentKit = kits.find( ( item ) => item.id === id );

					currentKit.isFavorite = isFavorite;

					return kits;
				}
			);
		}

		// Update specific kit if the kit exists
		if ( queryClient.getQueryData( [ kitKey, id ] ) ) {
			queryClient.setQueryData(
				[ kitKey, id ],
				( currentKit ) => {
					currentKit.isFavorite = isFavorite;

					return currentKit;
				}
			);
		}
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
