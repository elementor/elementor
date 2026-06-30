import { useMutation, useQuery, useQueryClient } from '@elementor/query';

import { apiClient } from '../api';

export const UNFILTERED_FILES_UPLOAD_KEY = 'elementor_unfiltered_files_upload';

const unfilteredFilesQueryKey = {
	queryKey: [ UNFILTERED_FILES_UPLOAD_KEY ],
};

type Value = '0' | '1';

export const useUnfilteredFilesUpload = () =>
	useQuery( {
		...unfilteredFilesQueryKey,
		queryFn: (): Promise< boolean > =>
			apiClient.getElementorSetting< Value >( UNFILTERED_FILES_UPLOAD_KEY ).then( ( res ) => {
				return formatResponse( res );
			} ),
		staleTime: Infinity,
	} );

export function useUpdateUnfilteredFilesUpload() {
	const queryClient = useQueryClient();

	const mutate = useMutation( {
		mutationFn: ( { allowUnfilteredFilesUpload }: { allowUnfilteredFilesUpload: boolean } ) =>
			apiClient.updateElementorSetting< Value >(
				UNFILTERED_FILES_UPLOAD_KEY,
				allowUnfilteredFilesUpload ? '1' : '0'
			),
		onSuccess: () => queryClient.invalidateQueries( unfilteredFilesQueryKey ),
	} );

	return mutate;
}

const formatResponse = ( response: Value ): boolean => {
	return Boolean( response === '1' );
};
