import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useHostDocument, useActiveDocument } from '@elementor/documents';
import RecentlyEdited from '../recently-edited';
import { createMockDocument } from 'test-utils';
import getRecentlyEditedPosts, { Post } from '../../../utils/fetch-posts';

jest.mock( '@elementor/documents', () => ( {
	useActiveDocument: jest.fn(),
	useHostDocument: jest.fn(),
} ) );

jest.mock( '../../../utils/fetch-posts', () => (
	{
		default: jest.fn().mockReturnValue( Promise.resolve( [] ) ),
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
		await waitFor( () => {
			expect( queryByText( 'Active Document' ) ).toBeTruthy();
			expect( queryByText( '(publish)' ) ).not.toBeTruthy();
		} );
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
		await waitFor( () => {
			expect( queryByText( 'Active Document' ) ).toBeTruthy();
			expect( queryByText( '(Draft)' ) ).toBeTruthy();
		} );
	} );

	it( 'should show the title of the host document when there is no active document', async () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => null );

		// Act.
		const { queryByText } = render( <RecentlyEdited /> );

		// Assert.
		await waitFor( () => {
			expect( queryByText( 'Host Document' ) ).toBeTruthy();
		} );
	} );

	it( 'should show the title of the host document when the active document is kit', async () => {
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
		await waitFor( () => {
			expect( queryByText( 'Host Document' ) ).toBeTruthy();
		} );
	} );

	it( 'should show nothing if there are no documents', async () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => null );
		jest.mocked( useHostDocument ).mockImplementation( () => null );

		// Act.
		const { queryByText } = render( <RecentlyEdited /> );

		// Assert.
		await waitFor( () => {
			expect( queryByText( 'Host Document' ) ).not.toBeTruthy();
			expect( queryByText( 'Active Document' ) ).not.toBeTruthy();
		} );
	} );

	it( 'should open the recently edited menu on click', async () => {
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
		const fetchReturnData = [ {
			id: 1,
			title: 'Test post',
			edit_url: 'some_url',
			type: {
				post_type: 'post',
				doc_type: 'wp-post',
				label: 'Post',
			},
			date_modified: 123,
		} ] as Post[];

		jest.mocked( getRecentlyEditedPosts ).mockReturnValue( Promise.resolve( fetchReturnData ) );

		const { getByText, getByRole, getAllByRole } = render( <RecentlyEdited /> );

		// Act.
		await waitFor( () => {
			const buttons = getAllByRole( 'button' );
			buttons[ 0 ].click(); // Opens the recently edited menu
		} );

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
