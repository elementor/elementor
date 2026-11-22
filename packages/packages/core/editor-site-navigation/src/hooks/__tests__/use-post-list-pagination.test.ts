import { act, renderHook } from '@testing-library/react';

import { POST_PER_PAGE } from '../../api/post';
import { usePostListPagination } from '../use-post-list-pagination';

describe( 'usePostListPagination', () => {
	const fetchNextPage = jest.fn();

	beforeEach( () => {
		fetchNextPage.mockClear();
	} );

	it( 'shows only the first page of items by default', () => {
		const { result } = renderHook( () =>
			usePostListPagination( {
				fetchNextPage,
				hasNextPage: true,
				isFetchingNextPage: false,
				loadedCount: POST_PER_PAGE,
				resetKey: 'page',
				totalCount: 25,
			} )
		);

		expect( result.current.visibleCount ).toBe( POST_PER_PAGE );
		expect( result.current.canLoadMore ).toBe( true );
		expect( result.current.canShowLess ).toBe( false );
	} );

	it( 'reveals more loaded items without fetching when the next page is already cached', () => {
		const { result } = renderHook( () =>
			usePostListPagination( {
				fetchNextPage,
				hasNextPage: false,
				isFetchingNextPage: false,
				loadedCount: 25,
				resetKey: 'page',
				totalCount: 25,
			} )
		);

		act( () => {
			result.current.handleLoadMore();
		} );

		expect( fetchNextPage ).not.toHaveBeenCalled();
		expect( result.current.visibleCount ).toBe( POST_PER_PAGE * 2 );
		expect( result.current.canShowLess ).toBe( true );
		expect( result.current.canLoadMore ).toBe( true );
	} );

	it( 'fetches the next page when additional items are not yet loaded', () => {
		const { result } = renderHook( () =>
			usePostListPagination( {
				fetchNextPage,
				hasNextPage: true,
				isFetchingNextPage: false,
				loadedCount: POST_PER_PAGE,
				resetKey: 'page',
				totalCount: 25,
			} )
		);

		act( () => {
			result.current.handleLoadMore();
		} );

		expect( fetchNextPage ).toHaveBeenCalled();
	} );

	it( 'returns to the first page when Show less is clicked', () => {
		const { result } = renderHook( () =>
			usePostListPagination( {
				fetchNextPage,
				hasNextPage: false,
				isFetchingNextPage: false,
				loadedCount: 25,
				resetKey: 'page',
				totalCount: 25,
			} )
		);

		act( () => {
			result.current.handleLoadMore();
		} );

		expect( result.current.visibleCount ).toBe( POST_PER_PAGE * 2 );

		act( () => {
			result.current.handleLoadMore();
		} );

		expect( result.current.visibleCount ).toBe( 25 );
		expect( result.current.canLoadMore ).toBe( false );

		act( () => {
			result.current.handleShowLess();
		} );

		expect( result.current.visibleCount ).toBe( POST_PER_PAGE );
		expect( result.current.canShowLess ).toBe( false );
		expect( result.current.canLoadMore ).toBe( true );
	} );

	it( 'resets visible count when the search key changes', () => {
		const { result, rerender } = renderHook(
			( { resetKey } ) =>
				usePostListPagination( {
					fetchNextPage,
					hasNextPage: true,
					isFetchingNextPage: false,
					loadedCount: 25,
					resetKey,
					totalCount: 25,
				} ),
			{ initialProps: { resetKey: 'page' } }
		);

		act( () => {
			result.current.handleLoadMore();
		} );

		expect( result.current.visibleCount ).toBe( POST_PER_PAGE * 2 );

		rerender( { resetKey: 'page:about' } );

		expect( result.current.visibleCount ).toBe( POST_PER_PAGE );
	} );
} );
