import * as React from 'react';
import { render } from '@testing-library/react';
import { useHostDocument, useActiveDocument } from '@elementor/documents';
import RecentlyEdited from '../recently-edited';
import { createMockDocument } from 'test-utils';
import useRecentPosts, { Post } from '../../../hooks/use-recent-posts';

jest.mock( '@elementor/documents', () => ( {
	useActiveDocument: jest.fn(),
	useHostDocument: jest.fn(),
} ) );

jest.mock( '../../../hooks/use-recent-posts', () => (
	{
		default: jest.fn( () => ( { isLoading: false, recentPosts: [] } ) ),
		__esModule: true,
	}
) );

describe( '@elementor/recently-edited - Top bar Recently Edited', () => {
	beforeEach( () => {
		jest.mocked( useActiveDocument ).mockImplementation( () =>
			createMockDocument( { id: 1, title: 'Active Document' } )
		);

		jest.mocked( useHostDocument ).mockImplementation( () =>
			createMockDocument( { id: 2, title: 'Host Document' } )
		);
	} );

	it( 'should show the title of the active document without its status when the document is published', async () => {
		// Act.
		const { queryByText } = render( <RecentlyEdited /> );

		// Assert.
		expect( queryByText( 'Active Document' ) ).toBeTruthy();
		expect( queryByText( '(publish)' ) ).not.toBeTruthy();
	} );

	it( 'should show the title of the active document with its status when the document is not published', async () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () =>
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
		const { queryByText } = render( <RecentlyEdited /> );

		// Assert.
		expect( queryByText( 'Active Document' ) ).toBeTruthy();
		expect( queryByText( '(Draft)' ) ).toBeTruthy();
	} );

	it( 'should show the title of the host document when there is no active document', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => null );

		// Act.
		const { queryByText } = render( <RecentlyEdited /> );

		// Assert.
		expect( queryByText( 'Host Document' ) ).toBeTruthy();
	} );

	it( 'should show the title of the host document when the active document is kit', () => {
		// Arrange.

		jest.mocked( useActiveDocument ).mockImplementation( () =>
			createMockDocument( {
				id: 1,
				title: 'Active Document',
				type: {
					value: 'kit',
					label: 'Kit',
				},
			} )
		);

		// Act.
		const { queryByText } = render( <RecentlyEdited /> );

		// Assert.
		expect( queryByText( 'Host Document' ) ).toBeTruthy();
	} );

	it( 'should show nothing if there are no documents', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => null );
		jest.mocked( useHostDocument ).mockImplementation( () => null );

		// Act.
		const { queryByText } = render( <RecentlyEdited /> );

		// Assert.
		expect( queryByText( 'Host Document' ) ).not.toBeTruthy();
		expect( queryByText( 'Active Document' ) ).not.toBeTruthy();
	} );

	it( 'should show empty state', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () =>
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
		const recentPosts: Post[] = [];

		jest.mocked( useRecentPosts ).mockReturnValue( { isLoading, recentPosts } );

		const { getByText, getAllByRole } = render( <RecentlyEdited /> );

		// Act.
		const buttons = getAllByRole( 'button' );
		buttons[ 0 ].click(); // Opens the recently edited menu

		// Assert.
		const label = getByText( 'There are no other pages or templates on this site yet', { exact: false } );
		expect( label ).toBeInTheDocument();
	} );

	it( 'should open the recently edited menu on click', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () =>
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
		const recentPosts: Post[] = [ {
			id: 1,
			title: 'Test post',
			edit_url: 'some_url',
			type: {
				post_type: 'post',
				doc_type: 'wp-post',
				label: 'Post',
			},
			date_modified: 123,
		} ];

		jest.mocked( useRecentPosts ).mockReturnValue( { isLoading, recentPosts } );

		const { getByText, getByRole, getAllByRole } = render( <RecentlyEdited /> );

		// Act.
		const buttons = getAllByRole( 'button' );
		buttons[ 0 ].click(); // Opens the recently edited menu

		// Assert.
		const menu = getByRole( 'menu' );
		expect( menu ).toBeInTheDocument();

		const label = getByText( 'Recent' );
		expect( label ).toBeInTheDocument();

		const menuItems = getAllByRole( 'menuitem' );
		expect( menuItems ).toHaveLength( 1 );
		expect( getByText( 'Test post' ) ).toBeInTheDocument();
	} );
} );
