import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { type Post } from '../../../../../types';
import Delete from '../delete';

const mockMutateAsync = jest.fn();
jest.mock( '../../../../../hooks/use-posts-actions', () => ( {
	usePostActions: () => ( {
		deletePost: {
			mutateAsync: mockMutateAsync,
			isPending: false,
		},
	} ),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn(),
} ) );

describe( '@elementor/editor-site-navigation/pages-panel-actions - Delete', () => {
	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'should render Delete, display the modal and run the delete action', () => {
		// Arrange.
		const post: Post = {
			id: 1,
			title: {
				rendered: 'Test Page',
			},
			status: 'publish',
			type: 'page',
			link: 'https://example.local/test-page',
			isHome: false,
			user_can: {
				edit: true,
				delete: true,
			},
		};

		// Act.
		renderWithTheme( <Delete post={ post } /> );

		// Assert.
		const button = screen.getByRole( 'menuitem' );
		expect( button ).not.toHaveAttribute( 'aria-disabled' );

		// Open the modal.
		fireEvent.click( button );

		const modal = screen.getByText( 'Delete "Test Page"?' );
		expect( modal ).toBeInTheDocument();

		const modalButtons = screen.getAllByRole( 'button' );
		expect( modalButtons[ 0 ] ).toHaveTextContent( 'Cancel' );
		expect( modalButtons[ 1 ] ).toHaveTextContent( 'Delete' );

		// Click the delete button.
		fireEvent.click( modalButtons[ 1 ] );

		expect( mockMutateAsync ).toHaveBeenCalledTimes( 1 );
		expect( mockMutateAsync ).toHaveBeenCalledWith( post.id );
	} );

	it( 'should render Delete disabled when post is homepage', () => {
		// Arrange.
		const post: Post = {
			id: 1,
			title: {
				rendered: 'Test Page',
			},
			status: 'draft',
			type: 'page',
			link: 'https://example.local/test-page',
			isHome: true,
			user_can: {
				edit: true,
				delete: true,
			},
		};

		// Act.
		renderWithTheme( <Delete post={ post } /> );

		// Assert.
		const button = screen.getByRole( 'menuitem' );
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
	} );
} );
