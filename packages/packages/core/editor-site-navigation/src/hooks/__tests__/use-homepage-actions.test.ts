import { renderHookWithQuery } from 'test-utils';
import apiFetch from '@wordpress/api-fetch';

import { settingsQueryKey } from '../use-homepage';
import { useHomepageActions } from '../use-homepage-actions';

jest.mock( '@wordpress/api-fetch' );

describe( '@elementor/site-settings/use-homepage-actions', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve( {} ) );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should run updateSettings from useHomepageActions hook', async () => {
		// Arrange.
		const { component, queryClient } = renderHookWithQuery( () => useHomepageActions() );
		const { updateSettingsMutation } = component.result.current;

		const queryKey = settingsQueryKey();
		await queryClient.setQueryData( queryKey, {
			show_on_front: '',
			page_on_front: 0,
		} );

		// Act.
		await updateSettingsMutation.mutateAsync( { show_on_front: 'page', page_on_front: 1 } );

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/wp/v2/settings',
			method: 'POST',
			data: {
				show_on_front: 'page',
				page_on_front: 1,
			},
		} );

		expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( true );
	} );
} );
