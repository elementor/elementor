import apiFetch from '@wordpress/api-fetch';

import { createMenus } from '../menus';

jest.mock( '@wordpress/api-fetch' );

const mockApiFetch = jest.mocked( apiFetch );

describe( '@elementor/site-builder/deploy/menus', () => {
	beforeEach( () => {
		mockApiFetch.mockReset();
	} );

	describe( 'createMenus', () => {
		it( 'creates menus without locations when none are registered', async () => {
			mockApiFetch
				.mockResolvedValueOnce( {} )
				.mockResolvedValueOnce( { id: 11 } )
				.mockResolvedValueOnce( {} );

			await createMenus(
				{
					header: [ { title: 'Home', pageId: 'home' } ],
					footer: [],
				},
				{ home: 42 }
			);

			expect( mockApiFetch ).toHaveBeenNthCalledWith( 2, {
				path: '/wp/v2/menus',
				method: 'POST',
				data: {
					name: expect.stringMatching( /^Header-/ ),
					auto_add: false,
				},
			} );
		} );
	} );
} );
