import * as React from 'react';
import { createMockDocument, renderWithQuery } from 'test-utils';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { PostListContextProvider } from '../../../../contexts/post-list-context';
import { usePosts } from '../../../../hooks/use-posts';
import PostsCollapsibleList from '../posts-collapsible-list';

const mockMutateAsync = jest.fn();
jest.mock( '../../../../hooks/use-posts-actions', () => ( {
	usePostActions: () => ( {
		createPost: {
			mutateAsync: mockMutateAsync,
			isPending: false,
		},
		duplicatePost: {
			mutateAsync: mockMutateAsync,
			isPending: false,
		},
	} ),
} ) );

jest.mock( '../../../../hooks/use-posts', () => ( {
	__esModule: true,
	usePosts: jest.fn( () => ( {
		isLoading: false,
		data: {
			posts: [
				{
					id: 1,
					type: 'page',
					title: { rendered: 'Home' },
					status: 'publish',
					link: 'www.test.demo',
					user_can: { edit: true, delete: true },
				},
				{
					id: 2,
					type: 'page',
					title: { rendered: 'About' },
					status: 'draft',
					link: 'www.test.demo',
					user_can: { edit: true, delete: true },
				},
			],
			total: 2,
		},
	} ) ),
} ) );

jest.mock( '../../../../hooks/use-homepage', () => ( {
	__esModule: true,
	useHomepage: jest.fn( () => ( {
		isLoading: false,
		data: 1,
	} ) ),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn(),
	__useNavigateToDocument: jest.fn(),
} ) );

jest.mock( '../../../../hooks/use-user', () => ( {
	default: jest.fn( () => ( {
		isLoading: false,
		data: {
			capabilities: {
				edit_pages: true,
			},
		},
	} ) ),
	__esModule: true,
} ) );

describe( '@elementor/editor-site-navigation - PostsCollapsibleList', () => {
	beforeEach( () => {
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				id: 3,
			} )
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render closed list', () => {
		// Act.
		renderWithQuery( <PostsCollapsibleList isOpenByDefault={ false } /> );

		// Assert.
		const label = screen.getByText( `Pages (2)` );
		expect( label ).toBeInTheDocument();

		const postInList = screen.queryByText( 'Home' );
		expect( postInList ).not.toBeInTheDocument();
	} );

	it( 'should render open list with home icon and page status', () => {
		// Act.
		renderWithQuery( <PostsCollapsibleList isOpenByDefault={ true } /> );

		// Assert.
		const items = screen.getAllByRole( 'listitem' );

		expect( items.length ).toBe( 3 );

		// First item is the list title.
		expect( items[ 0 ] ).toHaveTextContent( `Pages (2)` );
		expect( items[ 1 ] ).toHaveTextContent( 'Home' );
		expect( items[ 1 ] ).toHaveTextContent( 'Homepage' ); // Home icon.
		expect( items[ 2 ] ).toHaveTextContent( 'About' );
		expect( items[ 2 ] ).toHaveTextContent( '(draft)' );
	} );

	it( 'should create a new post after clicking "Add New" button', async () => {
		// Arrange.
		renderWithQuery(
			<PostListContextProvider type={ 'page' } setError={ () => {} }>
				<PostsCollapsibleList isOpenByDefault={ true } />
			</PostListContextProvider>
		);

		// Act.
		const addNewButton = screen.getByRole( 'button', { name: 'Add New' } );
		fireEvent.click( addNewButton );

		const input = screen.getByRole( 'textbox' );

		if ( ! input || ! ( input instanceof HTMLInputElement ) ) {
			throw new Error( 'No input field found.' );
		}

		expect( input ).toHaveValue( 'New Page' );

		fireEvent.change( input, { target: { value: 'New Page Title' } } );
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
			expect( screen.getByText( 'New Page Title' ) ).toBeInTheDocument();
		} ).then();
	} );

	it( 'should append a new list item in edit mode, when "Duplicate" action is clicked', () => {
		// Arrange.
		renderWithQuery(
			<PostListContextProvider type={ 'page' } setError={ () => {} }>
				<PostsCollapsibleList isOpenByDefault={ true } />
			</PostListContextProvider>
		);

		// Act.
		const buttons = screen.getAllByRole( 'button' );
		fireEvent.click( buttons[ 3 ] ); // Button to open the actions' menu of the first post.

		const duplicateButton = screen.getByRole( 'menuitem', { name: 'Duplicate' } );
		fireEvent.click( duplicateButton );

		// Assert.
		waitFor( () => {
			expect( duplicateButton ).not.toBeInTheDocument();
		} ).then();

		const input = screen.getByRole( 'textbox' );

		expect( input ).toBeInTheDocument();
		expect( input ).toHaveValue( 'Home copy' );
	} );

	it( 'Should not render load button when there is no next page', () => {
		// Arrange.
		jest.mocked( usePosts ).mockReturnValue( {
			hasNextPage: false,
			isLoading: false,
			data: {
				posts: [
					{
						id: 1,
						type: 'page',
						title: { rendered: 'Home' },
						status: 'publish',
						link: 'www.test.demo',
						user_can: { edit: true, delete: true },
					},
					{
						id: 2,
						type: 'page',
						title: { rendered: 'About' },
						status: 'draft',
						link: 'www.test.demo',
						user_can: { edit: true, delete: true },
					},
				],
				total: 2,
			},
		} as ReturnType< typeof usePosts > );
		renderWithQuery( <PostsCollapsibleList isOpenByDefault={ true } /> );

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'Load More' } ) ).not.toBeInTheDocument();
	} );

	it( 'Should render load button when there is next page', () => {
		// Arrange.
		jest.mocked( usePosts ).mockReturnValue( {
			hasNextPage: true,
			isLoading: false,
			data: {
				posts: [
					{
						id: 1,
						type: 'page',
						title: { rendered: 'Home' },
						status: 'publish',
						link: 'www.test.demo',
						user_can: { edit: true, delete: true },
					},
					{
						id: 2,
						type: 'page',
						title: { rendered: 'About' },
						status: 'draft',
						link: 'www.test.demo',
						user_can: { edit: true, delete: true },
					},
				],
				total: 2,
			},
		} as ReturnType< typeof usePosts > );
		renderWithQuery( <PostsCollapsibleList isOpenByDefault={ true } /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Load More' } ) ).toBeInTheDocument();
	} );
} );
