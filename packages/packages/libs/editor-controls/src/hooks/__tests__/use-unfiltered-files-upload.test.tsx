import { type PropsWithChildren } from 'react';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { renderHook, waitFor } from '@testing-library/react';

import { apiClient } from '../../api';
import {
	UNFILTERED_FILES_UPLOAD_KEY,
	useUnfilteredFilesUpload,
	useUpdateUnfilteredFilesUpload,
} from '../use-unfiltered-files-upload';

jest.mock( '../../api' );

const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
const wrapper = ( { children }: PropsWithChildren ) => (
	<QueryClientProvider client={ queryClient }>{ children } </QueryClientProvider>
);

describe( 'useUnfilteredFilesUpload', () => {
	it( `should return data as true when "${ UNFILTERED_FILES_UPLOAD_KEY }" value is "1"`, async () => {
		// Arrange.
		jest.mocked( apiClient ).getElementorSetting.mockReturnValue( Promise.resolve( '1' ) );

		// Act.
		const { result } = renderHook( () => useUnfilteredFilesUpload(), { wrapper } );

		// Assert.
		await waitFor( () => expect( result.current.isPending ).toBe( false ) );
		await waitFor( () => expect( result.current.data ).toBe( true ) );
	} );
} );

describe( 'useUpdateUnfilteredFilesUpload', () => {
	it( 'should call updateElementorSetting with "1" when useUpdateUnfilteredFilesUpload().mutate is called', async () => {
		// Arrange.
		const mockUpdate = jest.mocked( apiClient ).updateElementorSetting;

		// Act.
		const { result } = renderHook( () => useUpdateUnfilteredFilesUpload(), { wrapper } );

		result.current.mutate( { allowUnfilteredFilesUpload: true } );

		// Assert.
		await waitFor( () => expect( mockUpdate ).toHaveBeenCalledWith( UNFILTERED_FILES_UPLOAD_KEY, '1' ) );
	} );
} );
