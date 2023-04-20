import * as React from 'react';
import { render } from '@testing-library/react';
import { useHostDocument, useActiveDocument } from '@elementor/documents';
import RecentlyEdited from '../recently-edited';
import { createMockDocument } from 'test-utils';
import useRecentPosts, { Post } from '../../../hooks/use-recent-posts';
import { NewPost } from '../../../hooks/use-page';

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

describe( '@elementor/recently-edited - Top bar add new page', () => {
	beforeEach( () => {
		jest.mocked( useActiveDocument ).mockImplementation( () =>
			createMockDocument( { id: 1, title: 'Active Document' } )
		);

		jest.mocked( useHostDocument ).mockImplementation( () =>
			createMockDocument( { id: 2, title: 'Host Document' } )
		);
	} );

	it( 'should render add new page button', () => {
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
		const label = getByText( 'Add new page', { exact: false } );
		expect( label ).toBeInTheDocument();
	} );
} );
