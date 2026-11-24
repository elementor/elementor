import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { PostListContextProvider } from '../../../../../contexts/post-list-context';
import { type Post } from '../../../../../types';
import Restore from '../restore';

const mockMutateAsync = jest.fn();
const mockSetError = jest.fn();

jest.mock( '../../../../../hooks/use-posts-actions', () => ( {
	usePostActions: () => ( {
		restorePost: {
			isPending: false,
			mutateAsync: mockMutateAsync,
		},
	} ),
} ) );

const trashedPost: Post = {
	id: 1,
	link: 'https://example.local/test-page',
	status: 'trash',
	title: { rendered: 'Test Page' },
	type: 'page',
	user_can: { delete: true, edit: false },
};

describe( 'Restore', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'shows restore helper copy for v1 draft restore', () => {
		renderWithTheme(
			<PostListContextProvider setError={ mockSetError } type="page">
				<Restore post={ trashedPost } />
			</PostListContextProvider>
		);

		expect( screen.getByText( 'Restored as draft' ) ).toBeInTheDocument();
	} );

	it( 'runs restore when the menu item is clicked', () => {
		mockMutateAsync.mockResolvedValue( {} );

		renderWithTheme(
			<PostListContextProvider setError={ mockSetError } type="page">
				<Restore post={ trashedPost } />
			</PostListContextProvider>
		);

		fireEvent.click( screen.getByRole( 'menuitem', { name: /Restore/i } ) );

		expect( mockMutateAsync ).toHaveBeenCalledWith( trashedPost.id );
		expect( mockSetError ).not.toHaveBeenCalled();
	} );

	it( 'calls setError when restore fails', async () => {
		mockMutateAsync.mockRejectedValue( new Error( 'REST error' ) );

		renderWithTheme(
			<PostListContextProvider setError={ mockSetError } type="page">
				<Restore post={ trashedPost } />
			</PostListContextProvider>
		);

		fireEvent.click( screen.getByRole( 'menuitem', { name: /Restore/i } ) );

		await waitFor( () => {
			expect( mockSetError ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
