import * as React from 'react';
import { renderWithQuery } from 'test-utils';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { PostListContextProvider } from '../../../../contexts/post-list-context';
import { type Post } from '../../../../types';
import PostListItem from '../post-list-item';

const mockMutateAsync = jest.fn();
jest.mock( '../../../../hooks/use-posts-actions', () => ( {
	usePostActions: () => ( {
		updatePost: {
			mutateAsync: mockMutateAsync,
			isPending: false,
		},
	} ),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn(),
	__useNavigateToDocument: jest.fn(),
} ) );

describe( '@elementor/editor-site-navigation - PostListItem', () => {
	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'should render a published page', () => {
		// Arrange.
		const post: Post = {
			id: 1,
			title: {
				rendered: 'Test Page',
			},
			status: 'publish',
			type: 'page',
			link: 'https://example.local/test-page',
			user_can: {
				edit: true,
				delete: true,
			},
		};

		// Act.
		renderWithQuery( <PostListItem post={ post } /> );

		// Assert.
		const label = screen.getByText( 'Test Page' );
		const publishedLabel = screen.queryByText( 'publish', { exact: false } );

		expect( label ).toBeInTheDocument();
		expect( publishedLabel ).not.toBeInTheDocument();
	} );

	it( 'should show the page status for non-published pages', () => {
		// Arrange.
		const post: Post = {
			id: 1,
			title: {
				rendered: 'Test Page',
			},
			status: 'draft',
			type: 'page',
			link: 'https://example.local/test-page',
			user_can: {
				edit: true,
				delete: true,
			},
		};

		// Act.
		renderWithQuery( <PostListItem post={ post } /> );

		// Assert.
		const label = screen.getByText( 'draft', { exact: false } );
		expect( label ).toBeInTheDocument();
	} );

	it( 'should render actions menu', () => {
		// Arrange.
		const post: Post = {
			id: 1,
			title: {
				rendered: 'Test Page',
			},
			status: 'publish',
			type: 'page',
			link: 'https://example.local/test-Page',
			user_can: {
				edit: true,
				delete: true,
			},
		};

		const actions = [ 'View Page', 'Rename', 'Duplicate', 'Delete', 'Set as homepage' ];

		// Act.
		renderWithQuery( <PostListItem post={ post } /> );

		const buttons = screen.getAllByRole( 'button' );
		// Button to open menu
		const button = buttons[ 1 ];

		// Open menu
		fireEvent.click( button );

		// Assert.
		actions.forEach( ( action ) => {
			const label = screen.getByText( action );
			expect( label ).toBeInTheDocument();
		} );
	} );

	it( 'should navigate to document on click', () => {
		// Arrange.
		const navigateToDocument = jest.fn();
		jest.mocked( useNavigateToDocument ).mockReturnValue( navigateToDocument );

		const id = 10;

		const post: Post = {
			id,
			title: {
				rendered: 'Test Page',
			},
			status: 'publish',
			type: 'page',
			link: 'https://example.local/test-page',
			user_can: {
				edit: true,
				delete: true,
			},
		};

		// Act.
		renderWithQuery( <PostListItem post={ post } /> );

		const buttons = screen.getAllByRole( 'button' );
		const button = buttons[ 0 ];

		fireEvent.click( button );

		// Assert.
		expect( navigateToDocument ).toHaveBeenCalledTimes( 1 );
		expect( navigateToDocument ).toHaveBeenCalledWith( id );
	} );

	it( 'should put the list item in edit mode, when "Rename" action is clicked', () => {
		// Arrange.
		const post: Post = {
			id: 10,
			title: {
				rendered: 'Test Page',
			},
			status: 'publish',
			type: 'page',
			link: 'https://example.local/test-page',
			user_can: {
				edit: true,
				delete: true,
			},
		};

		renderWithQuery(
			<PostListContextProvider type={ 'page' } setError={ () => {} }>
				<PostListItem post={ post } />
			</PostListContextProvider>
		);

		// Act #1 - enter edit mode.
		const buttons = screen.getAllByRole( 'button' );
		fireEvent.click( buttons[ 1 ] ); // Button to open the actions' menu of the post.

		const renameButton = screen.getByRole( 'menuitem', { name: 'Rename' } );
		fireEvent.click( renameButton );

		// Assert.
		waitFor( () => {
			expect( renameButton ).not.toBeInTheDocument();
		} ).then();

		const input = screen.getByRole( 'textbox' );

		expect( input ).toBeInTheDocument();
		expect( input ).toHaveValue( 'Test Page' );

		// Act #2 - rename and reset edit mode.
		fireEvent.change( input, { target: { value: 'Renamed Title' } } );
		fireEvent.blur( input );

		// Assert.
		waitFor( () => {
			expect( input ).toHaveAttribute( 'aria-disabled', 'true' );
		} ).then();

		expect( mockMutateAsync ).toHaveBeenCalledTimes( 1 );

		waitFor( () => {
			expect( input ).not.toBeInTheDocument();
		} ).then();

		waitFor( () => {
			expect( screen.getByText( 'Renamed Title' ) ).toBeInTheDocument();
		} ).then();
	} );
} );
