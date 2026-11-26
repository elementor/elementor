import * as React from 'react';
import { createMockDocument, renderWithQuery } from 'test-utils';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import { POST_PER_PAGE } from '../../../../api/post';
import { ContentPanelCoordinatorProvider } from '../../../../contexts/content-panel-coordinator';
import { PostListContextProvider } from '../../../../contexts/post-list-context';
import { usePosts } from '../../../../hooks/use-posts';
import useUser from '../../../../hooks/use-user';
import PostsCollapsibleList from '../posts-collapsible-list';

const buildPosts = ( count: number ) =>
	Array.from( { length: count }, ( _, index ) => ( {
		id: index + 1,
		link: 'https://example.test',
		status: 'publish',
		title: { rendered: `Page ${ index + 1 }` },
		type: 'page',
		user_can: { edit: true, delete: true },
	} ) );

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

jest.mock( '../../../../hooks/use-posts-baseline-total', () => ( {
	__esModule: true,
	usePostsBaselineTotal: jest.fn( () => ( {
		data: undefined,
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

const defaultUsePostsValue = {
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
} as ReturnType< typeof usePosts >;

const restoreDefaultUsePosts = () => {
	jest.mocked( usePosts ).mockReset();
	jest.mocked( usePosts ).mockImplementation( () => defaultUsePostsValue );
};

const defaultUseUserValue = {
	isLoading: false,
	data: {
		capabilities: {
			edit_pages: true,
		},
	},
} as unknown as ReturnType< typeof useUser >;

describe( '@elementor/editor-site-navigation - PostsCollapsibleList', () => {
	beforeEach( () => {
		restoreDefaultUsePosts();
		jest.mocked( useUser ).mockReturnValue( defaultUseUserValue );
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				id: 3,
			} )
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
		restoreDefaultUsePosts();
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
		expect( screen.getByTitle( 'Homepage' ) ).toBeInTheDocument();
		expect( items[ 1 ] ).toHaveTextContent( 'About' );
		expect( items[ 1 ] ).toHaveTextContent( 'Draft' );
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

		const input = screen.getByDisplayValue( 'New Page' );

		if ( ! input || ! ( input instanceof HTMLInputElement ) ) {
			throw new Error( 'No input field found.' );
		}

		expect( input ).toHaveValue( 'New Page' );

		fireEvent.change( input, { target: { value: 'New Page Title' } } );
		fireEvent.blur( input );

		// Assert.
		await waitFor( () => {
			expect( mockMutateAsync ).toHaveBeenCalledWith( {
				title: 'New Page Title',
				status: 'draft',
			} );
		} );
	} );

	it( 'disables duplicate when user cannot create the post type', () => {
		jest.mocked( useUser ).mockReturnValue( {
			isLoading: false,
			data: {
				capabilities: {
					edit_posts: true,
				},
			},
		} as unknown as ReturnType< typeof useUser > );

		renderList(
			<PostListContextProvider type={ 'page' } setError={ () => {} }>
				<PostsCollapsibleList isOpenByDefault={ true } />
			</PostListContextProvider>
		);

		const [ homeRow ] = screen.getAllByRole( 'listitem' );
		const homeRowButtons = within( homeRow ).getAllByRole( 'button' );
		fireEvent.click( homeRowButtons[ homeRowButtons.length - 1 ] );

		expect( screen.getByRole( 'menuitem', { name: 'Duplicate' } ) ).toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'should append a new list item in edit mode, when "Duplicate" action is clicked', async () => {
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
		const input = await screen.findByDisplayValue( 'Home copy' );

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
		jest.mocked( usePosts ).mockImplementation( ( _type, search = '' ) => {
			const isEmptySearchResult = search === 'missing';

			return {
				isLoading: false,
				data: {
					posts: isEmptySearchResult ? [] : defaultUsePostsValue.data.posts,
					total: isEmptySearchResult ? 0 : defaultUsePostsValue.data.total,
				},
			} as ReturnType< typeof usePosts >;
		} );

		renderList(
			<PostListContextProvider type={ 'page' } setError={ () => {} }>
				<PostsCollapsibleList isOpenByDefault />
			</PostListContextProvider>
		);

		fireEvent.change( screen.getByRole( 'textbox', { name: 'Search' } ), {
			target: { value: 'missing' },
		} );

		await waitFor(
			() => {
				expect( screen.getByText( 'No results found' ) ).toBeInTheDocument();
			},
			{ timeout: 500 }
		);
	} );

	it( 'does not show no-results empty state when only sort is non-default', async () => {
		jest.mocked( usePosts ).mockReturnValue( {
			isLoading: false,
			data: {
				posts: [],
				total: 0,
			},
		} as unknown as ReturnType< typeof usePosts > );

		renderList(
			<PostListContextProvider type={ 'page' } setError={ () => {} }>
				<PostsCollapsibleList isOpenByDefault />
			</PostListContextProvider>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Sort' } ) );
		fireEvent.click( screen.getByRole( 'menuitemradio', { name: /Newest/i } ) );

		await waitFor( () => {
			expect( screen.queryByText( 'No results found' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders Load more when more items exist than the first page', () => {
		jest.mocked( usePosts ).mockReturnValue( {
			data: {
				posts: buildPosts( POST_PER_PAGE ),
				total: 25,
			},
			fetchNextPage: jest.fn(),
			hasNextPage: true,
			isFetchingNextPage: false,
			isLoading: false,
		} as unknown as ReturnType< typeof usePosts > );

		renderList( <PostsCollapsibleList isOpenByDefault={ true } /> );

		expect( screen.getByRole( 'button', { name: 'Load more' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Show less' } ) ).not.toBeInTheDocument();
	} );

	it( 'expands and collapses the visible list using Load more and Show less', () => {
		jest.mocked( usePosts ).mockReturnValue( {
			data: {
				posts: buildPosts( 25 ),
				total: 25,
			},
			fetchNextPage: jest.fn(),
			hasNextPage: false,
			isFetchingNextPage: false,
			isLoading: false,
		} as unknown as ReturnType< typeof usePosts > );

		renderList( <PostsCollapsibleList isOpenByDefault={ true } /> );

		expect( screen.getByText( 'Page 10' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Page 11' ) ).not.toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: 'Load more' } ) );

		expect( screen.getByText( 'Page 20' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Show less' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Load more' } ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: 'Load more' } ) );

		expect( screen.getByText( 'Page 25' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Load more' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Show less' } ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: 'Show less' } ) );

		expect( screen.queryByText( 'Page 25' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Page 10' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Show less' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Load more' } ) ).toBeInTheDocument();
	} );
} );
