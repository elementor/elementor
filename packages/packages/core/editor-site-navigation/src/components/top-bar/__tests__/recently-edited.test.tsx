import * as React from 'react';
import { createMockDocument, renderWithTheme } from 'test-utils';
import {
	__useActiveDocument as useActiveDocument,
	__useHostDocument as useHostDocument,
	__useNavigateToDocument as useNavigateToDocument,
} from '@elementor/editor-documents';
import { fireEvent, screen } from '@testing-library/react';

import useRecentPosts from '../../../hooks/use-recent-posts';
import { type RecentPost } from '../../../types';
import RecentlyEdited from '../recently-edited';

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn(),
	__useHostDocument: jest.fn(),
	__useNavigateToDocument: jest.fn(),
} ) );

jest.mock( '../../../hooks/use-recent-posts', () => ( {
	default: jest.fn( () => ( { isLoading: false, data: [] } ) ),
	__esModule: true,
} ) );

jest.mock( '../../../hooks/use-user', () => ( {
	default: jest.fn( () => ( {
		isLoading: false,
		data: {
			capabilities: {
				edit_posts: true,
			},
		},
	} ) ),
	__esModule: true,
} ) );

describe( '@elementor/recently-edited - Top bar Recently Edited', () => {
	it( 'should show the title of the active document without its status when the document is published', async () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				id: 1,
				title: 'Active Document',
			} )
		);

		// Act.
		renderWithTheme( <RecentlyEdited /> );

		// Assert.
		expect( screen.getByText( 'Active Document' ) ).toBeInTheDocument();
		expect( screen.queryByText( '(publish)' ) ).not.toBeInTheDocument();
	} );

	it( 'should show the title of the active document with its status when the document is not published', async () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				id: 1,
				title: 'Active Document',
				status: {
					value: 'draft',
					label: 'Draft',
				},
			} )
		);

		// Act.
		renderWithTheme( <RecentlyEdited /> );

		// Assert.
		expect( screen.getByText( 'Active Document' ) ).toBeInTheDocument();
		expect( screen.getByText( '(Draft)' ) ).toBeInTheDocument();
	} );

	it( 'should show the title of the host document when there is no active document', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( null );

		jest.mocked( useHostDocument ).mockReturnValue(
			createMockDocument( {
				id: 1,
				title: 'Host Document',
			} )
		);

		// Act.
		renderWithTheme( <RecentlyEdited /> );

		// Assert.
		expect( screen.getByText( 'Host Document' ) ).toBeInTheDocument();
	} );

	it( 'should show the title of the host document when the active document is kit', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				id: 1,
				title: 'Active Document',
				type: {
					value: 'kit',
					label: 'Kit',
				},
			} )
		);

		jest.mocked( useHostDocument ).mockReturnValue(
			createMockDocument( {
				id: 2,
				title: 'Host Document',
			} )
		);

		// Act.
		renderWithTheme( <RecentlyEdited /> );

		// Assert.
		expect( screen.getByText( 'Host Document' ) ).toBeInTheDocument();
	} );

	it( 'should show nothing if there are no documents', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( null );
		jest.mocked( useHostDocument ).mockReturnValue( null );

		// Act.
		renderWithTheme( <RecentlyEdited /> );

		// Assert.
		expect( screen.queryByText( 'Host Document' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Active Document' ) ).not.toBeInTheDocument();
	} );

	it( 'should show empty state', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				id: 1,
				title: 'Header',
				type: {
					value: 'header',
					label: 'Header',
				},
			} )
		);

		const isLoading = false;
		const recentPosts: RecentPost[] = [];

		jest.mocked( useRecentPosts ).mockReturnValue( { isLoading, data: recentPosts } as ReturnType<
			typeof useRecentPosts
		> );

		renderWithTheme( <RecentlyEdited /> );

		// Act.
		const buttons = screen.getAllByRole( 'button' );
		fireEvent.click( buttons[ 0 ] ); // Opens the recently edited menu

		// Assert.
		const label = screen.getByText( 'There are no other pages or templates on this site yet', { exact: false } );
		expect( label ).toBeInTheDocument();
	} );

	it( 'should open the recently edited menu on click', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				id: 1,
				title: 'Header',
				type: {
					value: 'header',
					label: 'Header',
				},
			} )
		);

		const isLoading = false;
		const recentPosts: RecentPost[] = [
			{
				id: 2,
				title: 'Test post',
				edit_url: 'some_url',
				type: {
					post_type: 'post',
					doc_type: 'wp-post',
					label: 'Post',
				},
				date_modified: 123,
				user_can: {
					edit: true,
				},
			},
		];

		jest.mocked( useRecentPosts ).mockReturnValue( { isLoading, data: recentPosts } as ReturnType<
			typeof useRecentPosts
		> );

		renderWithTheme( <RecentlyEdited /> );

		// Act.
		const buttons = screen.getAllByRole( 'button' );
		fireEvent.click( buttons[ 0 ] ); // Opens the recently edited menu

		// Assert.
		const menu = screen.getByRole( 'menu' );
		expect( menu ).toBeInTheDocument();

		const label = screen.getByText( 'Recent' );
		expect( label ).toBeInTheDocument();

		expect( screen.getByText( 'Test post' ) ).toBeInTheDocument();
	} );

	it( 'should render titles with HTML entities', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				id: 1,
				title: 'Header title with special char &#165;',
				type: {
					value: 'header',
					label: 'Header',
				},
			} )
		);

		const isLoading = false;
		const recentPosts: RecentPost[] = [
			{
				id: 1,
				title: 'Header title with special char &#165;',
				edit_url: 'some_url',
				type: {
					post_type: 'post',
					doc_type: 'wp-post',
					label: 'Post',
				},
				date_modified: 123,
				user_can: {
					edit: true,
				},
			},
			{
				id: 3,
				title: 'Post title with <h1>HTML</h1>',
				edit_url: 'some_url',
				type: {
					post_type: 'post',
					doc_type: 'wp-post',
					label: 'Post',
				},
				date_modified: 123,
				user_can: {
					edit: true,
				},
			},
			{
				id: 2,
				title: 'Post title with &lt;HTML entities&gt;',
				edit_url: 'some_url_2',
				type: {
					post_type: 'post',
					doc_type: 'wp-post',
					label: 'Post 2',
				},
				date_modified: 1234,
				user_can: {
					edit: true,
				},
			},
		];

		jest.mocked( useRecentPosts ).mockReturnValue( { isLoading, data: recentPosts } as ReturnType<
			typeof useRecentPosts
		> );

		// Act.
		renderWithTheme( <RecentlyEdited /> );

		// Assert - the document title should be rendered with the HTML entity.
		expect( screen.getByText( 'Header title with special char ¥' ) ).toBeInTheDocument();

		// Open the posts list.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Assert - the post title should be rendered with the HTML entity.
		expect( screen.getByText( 'Post title with <h1>HTML</h1>' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Post title with <HTML entities>' ) ).toBeInTheDocument();
	} );

	it( 'should navigate to document on click', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				id: 1,
				title: 'Test',
			} )
		);

		const navigateToDocument = jest.fn();

		jest.mocked( useNavigateToDocument ).mockReturnValue( navigateToDocument );

		jest.mocked( useRecentPosts ).mockReturnValue( {
			isLoading: false,
			data: [
				{
					id: 123,
					title: 'Test post',
					edit_url: 'some_url',
					type: {
						post_type: 'post',
						doc_type: 'wp-post',
						label: 'Post',
					},
					date_modified: 123,
					user_can: {
						edit: true,
					},
				},
			],
		} as ReturnType< typeof useRecentPosts > );

		renderWithTheme( <RecentlyEdited /> );

		// Open the posts list.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Act.
		fireEvent.click( screen.getByText( 'Test post' ) );

		// Assert.
		expect( navigateToDocument ).toHaveBeenCalledTimes( 1 );
		expect( navigateToDocument ).toHaveBeenCalledWith( 123 );
	} );

	it( 'should be disabled when user cant edit post', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				id: 1,
				title: 'Test',
			} )
		);

		const navigateToDocument = jest.fn();

		jest.mocked( useNavigateToDocument ).mockReturnValue( navigateToDocument );

		jest.mocked( useRecentPosts ).mockReturnValue( {
			isLoading: false,
			data: [
				{
					id: 123,
					title: 'Test post',
					edit_url: 'some_url',
					type: {
						post_type: 'post',
						doc_type: 'wp-post',
						label: 'Post',
					},
					date_modified: 123,
					user_can: {
						edit: false,
					},
				},
			],
		} as ReturnType< typeof useRecentPosts > );

		renderWithTheme( <RecentlyEdited /> );

		// Open the posts list.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Assert.
		const listItem = screen.getAllByRole( 'menuitem' )[ 0 ];
		expect( listItem ).toHaveAttribute( 'aria-disabled', 'true' );
	} );
} );
