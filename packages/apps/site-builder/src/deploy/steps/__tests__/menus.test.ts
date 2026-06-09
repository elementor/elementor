import apiFetch from '@wordpress/api-fetch';

import { createMenus, resolveMenuLocations } from '../menus';

jest.mock( '@wordpress/api-fetch' );

const mockApiFetch = jest.mocked( apiFetch );

describe( '@elementor/site-builder/deploy/menus', () => {
	beforeEach( () => {
		mockApiFetch.mockReset();
	} );

	describe( 'resolveMenuLocations', () => {
		it( 'maps hello-style menu locations to header and footer', async () => {
			mockApiFetch.mockResolvedValueOnce( {
				'menu-1': { name: 'menu-1', description: 'Header' },
				'menu-2': { name: 'menu-2', description: 'Footer' },
			} );

			await expect( resolveMenuLocations() ).resolves.toEqual( {
				header: 'menu-1',
				footer: 'menu-2',
			} );
		} );

		it( 'returns empty locations when the theme registers none', async () => {
			mockApiFetch.mockResolvedValueOnce( {} );

			await expect( resolveMenuLocations() ).resolves.toEqual( {
				header: '',
				footer: '',
			} );
		} );
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
