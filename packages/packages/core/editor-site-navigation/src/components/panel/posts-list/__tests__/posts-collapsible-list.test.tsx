import * as React from 'react';
import { createMockDocument, renderWithQuery } from 'test-utils';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import {
	ContentPanelCoordinatorProvider,
	useContentPanelCoordinator,
} from '../../../../contexts/content-panel-coordinator';
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

const renderList = ( ui: React.ReactElement ) =>
	renderWithQuery( <ContentPanelCoordinatorProvider>{ ui }</ContentPanelCoordinatorProvider> );

function SearchHarness() {
	const { setSearchQuery } = useContentPanelCoordinator();

	return (
		<>
			<button type="button" onClick={ () => setSearchQuery( 'missing' ) }>
				Search missing
			</button>
			<PostsCollapsibleList isOpenByDefault />
		</>
	);
}

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
		renderList( <PostsCollapsibleList isOpenByDefault={ false } /> );

		// Assert.
		expect( screen.getByText( 'Pages' ) ).toBeInTheDocument();
		expect( screen.getByText( '2' ) ).toBeInTheDocument();

		const postInList = screen.queryByText( 'Home' );
		expect( postInList ).not.toBeInTheDocument();
	} );

	it( 'should render open list with home icon and page status', () => {
		// Act.
		renderList( <PostsCollapsibleList isOpenByDefault={ true } /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Pages (2)' } ) ).toBeInTheDocument();

		const items = screen.getAllByRole( 'listitem' );

		expect( items.length ).toBe( 2 );
		expect( items[ 0 ] ).toHaveTextContent( 'Home' );
		expect( items[ 0 ] ).toHaveTextContent( 'Homepage' );
		expect( items[ 1 ] ).toHaveTextContent( 'About' );
		expect( items[ 1 ] ).toHaveTextContent( '(draft)' );
	} );

	it( 'should create a new post after clicking section add button', async () => {
		// Arrange.
		renderList(
			<PostListContextProvider type={ 'page' } setError={ () => {} }>
				<PostsCollapsibleList isOpenByDefault={ true } />
			</PostListContextProvider>
		);

		// Act.
		const addNewButton = screen.getByRole( 'button', { name: 'New Page' } );
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
		renderList(
			<PostListContextProvider type={ 'page' } setError={ () => {} }>
				<PostsCollapsibleList isOpenByDefault={ true } />
			</PostListContextProvider>
		);

		// Act.
		const [ homeRow ] = screen.getAllByRole( 'listitem' );
		const homeRowButtons = within( homeRow ).getAllByRole( 'button' );
		fireEvent.click( homeRowButtons[ homeRowButtons.length - 1 ] );

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
		renderList( <PostsCollapsibleList isOpenByDefault={ true } /> );

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'Load more' } ) ).not.toBeInTheDocument();
	} );

	it( 'shows empty state when search has no matches', async () => {
		const searchDebounceMs = 300;

		jest.useFakeTimers();

		jest.mocked( usePosts ).mockImplementation( ( _type, search = '' ) =>
			( {
				isLoading: false,
				data: {
					posts:
						search === 'missing'
							? []
							: [
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
					total: search === 'missing' ? 0 : 2,
				},
			} ) as ReturnType< typeof usePosts >
		);

		renderList(
			<PostListContextProvider type={ 'page' } setError={ () => {} }>
				<SearchHarness />
			</PostListContextProvider>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Search missing' } ) );
		jest.advanceTimersByTime( searchDebounceMs );

		await waitFor( () => {
			expect( screen.getByText( 'No results found' ) ).toBeInTheDocument();
		} );

		jest.useRealTimers();

		jest.mocked( usePosts ).mockImplementation( () =>
			( {
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
			} ) as ReturnType< typeof usePosts >
		);
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
		renderList( <PostsCollapsibleList isOpenByDefault={ true } /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Load more' } ) ).toBeInTheDocument();
	} );
} );
