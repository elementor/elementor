import { useMutation, useQueryClient } from 'react-query';
import { KEY as kitsKey } from '../hooks/use-cloud-kits';
import { KEY as quotaKey } from 'elementor-app/hooks/use-cloud-kits-quota';

export function useKitCloudMutations() {
	const queryClient = useQueryClient();

	const remove = useMutation(
		( id ) => $e.data.delete( 'cloud-kits/index', { id } ),
		{
			onSuccess: () => {
				queryClient.invalidateQueries( kitsKey );
				queryClient.invalidateQueries( quotaKey );
			},
		},
	);

	return {
		remove,
		isLoading: remove.isLoading,
	};
}
