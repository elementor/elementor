import { renderHookWithQuery } from 'test-utils';
import { waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';

import { POST_PER_PAGE } from '../../api/post';
import { usePosts } from '../use-posts';

const MOCK_POST_PER_PAGE = 2;

jest.mock( '@wordpress/api-fetch', () => ( {
	default: jest.fn( ( param ) => {
		const pages = [
			{ id: 1, type: 'page', title: { rendered: 'Home' }, status: 'draft', link: 'www.test.demo' },
			{ id: 2, type: 'page', title: { rendered: 'About' }, status: 'publish', link: 'www.test.demo' },
			{
				id: 3,
				type: 'page',
				title: { rendered: 'Services' },
				status: 'publish',
				link: 'www.test.demo',
				isHome: true,
			},
		];

		const url = new URL( 'http:/example.com' + param.path );

		const page = Number( url.searchParams.get( 'page' ) );

		const startIndex = ( page - 1 ) * MOCK_POST_PER_PAGE;
		const endIndex = startIndex + MOCK_POST_PER_PAGE;
		const paginatedPages = pages.slice( startIndex, endIndex );

		return {
			json: () => Promise.resolve( paginatedPages ),
			headers: {
				get: ( header: string ) => {
					switch ( header ) {
						case 'x-wp-totalpages':
							return Math.ceil( pages.length / MOCK_POST_PER_PAGE );
						case 'x-wp-total':
							return pages.length;
						default:
							return null;
					}
				},
			},
		};
	} ),
	__esModule: true,
} ) );

describe( '@elementor/site-settings/use-posts', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'usePosts hook should return posts list by type', async () => {
		//Arrange
		const pages = [
			{ id: 1, type: 'page', title: { rendered: 'Home' }, status: 'draft', link: 'www.test.demo' },
			{ id: 2, type: 'page', title: { rendered: 'About' }, status: 'publish', link: 'www.test.demo' },
			{
				id: 3,
				type: 'page',
				title: { rendered: 'Services' },
				status: 'publish',
				link: 'www.test.demo',
				isHome: true,
			},
		];

		// Act.
		const { component } = renderHookWithQuery( () => usePosts( 'page' ) );

		// Assert.
		const expectedPath = `/wp/v2/pages?status=any&order=asc&page=1&per_page=${ POST_PER_PAGE }&_fields=${ encodeURIComponent(
			'id,type,title,link,status,user_can'
		) }`;

		expect( apiFetch ).toHaveBeenCalledWith( {
			parse: false,
			path: expectedPath,
		} );
		expect( apiFetch ).toHaveBeenCalledTimes( 1 );

		await waitFor( () => {
			expect( component.result.current.isLoading ).toBeFalsy();
		} );

		expect( component.result.current.data.posts ).toContainEqual( pages[ 0 ] );
		expect( component.result.current.data.posts ).toContainEqual( pages[ 1 ] );
		expect( component.result.current.data.posts ).not.toContainEqual( pages[ 2 ] );
	} );
} );
