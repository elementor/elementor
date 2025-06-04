import { useCallback } from 'react';
import { KEY as kitsKey } from '../hooks/use-kits-cloud';
import { useMutation, useQueryClient } from 'react-query';

export function useKitCloudMutations() {
	const queryClient = useQueryClient();

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

	const remove = useMutation(
		( id ) => $e.data.delete( 'kits-cloud', { id } ),
		{ onSuccess: onRemoveSuccess },
	);
	const download = useMutation( ( id ) => $e.data.get( 'kits-cloud', { id }, { refresh: true } ) );

	return {
		remove,
		download,
		isLoading: remove.isLoading || download.isLoading,
	};
}
