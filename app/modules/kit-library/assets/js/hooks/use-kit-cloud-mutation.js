import { useCallback } from 'react';
import { KEY as kitsKey } from '../hooks/use-kits-cloud';
import { useMutation, useQueryClient } from 'react-query';

export function useKitCloudMutations() {
	const queryClient = useQueryClient();

	const onRenameSuccess = useCallback( ( { data } ) => {
		const id = data.data.id;
		const title = data.data.title;

		if ( queryClient.getQueryData( [ kitsKey ] ) ) {
			queryClient.setQueryData(
				[ kitsKey ],
				( kits ) => {
					if ( ! kits ) {
						return kits;
					}

					return kits.map( ( item ) => {
						if ( item.id === id ) {
							item.title = title;

							// Should return a new kit to trigger rerender.
							return item.clone();
						}

						return item;
					} );
				},
			);
		}
	}, [ queryClient ] );

	const onRemoveSuccess = useCallback( ( { data } ) => {
		const id = data.data.id;

		if ( queryClient.getQueryData( [ kitsKey ] ) ) {
			queryClient.setQueryData(
				[ kitsKey ],
				( kits ) => {
					if ( ! kits ) {
						return kits;
					}

					return kits.filter( ( item ) => item.id !== id );
				},
			);
		}
	}, [ queryClient ] );

	const rename = useMutation(
		( { id, title } ) => $e.data.update( 'kits-cloud', { title }, { id }, { refresh: true } ),
		{ onSuccess: onRenameSuccess },
	);
	const remove = useMutation(
		( id ) => $e.data.delete( 'kits-cloud', { id } ),
		{ onSuccess: onRemoveSuccess },
	);
	const download = useMutation( ( id ) => $e.data.get( 'kits-cloud', { id }, { refresh: true } ) );

	return {
		rename,
		remove,
		download,
		isLoading: rename.isLoading || remove.isLoading || download.isLoading,
	};
}
