import { useMutation, useQueryClient } from 'react-query';
import { KEY as kitsKey } from '../hooks/use-cloud-kits';

export function useKitCloudMutations() {
	const queryClient = useQueryClient();

	const remove = useMutation(
		( id ) => $e.data.delete( 'cloud-kits/index', { id } ),
		{ onSuccess: () => queryClient.invalidateQueries( kitsKey ) },
	);

	return {
		remove,
		isLoading: remove.isLoading,
	};
}
