import * as React from 'react';
import { createMockDocument, renderWithTheme } from 'test-utils';
import {
	__useActiveDocument as useActiveDocument,
	__useNavigateToDocument as useNavigateToDocument,
} from '@elementor/editor-documents';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import useCreatePage from '../../../hooks/use-create-page';
import useRecentPosts from '../../../hooks/use-recent-posts';
import useUser from '../../../hooks/use-user';
import { type RecentPost } from '../../../types';
import RecentlyEdited from '../recently-edited';

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn(),
	__useHostDocument: jest.fn(),
	__useNavigateToDocument: jest.fn(),
} ) );

jest.mock( '../../../hooks/use-recent-posts', () => ( {
	__esModule: true,
	default: jest.fn( () => ( { isLoading: false, recentPosts: [] } ) ),
} ) );

jest.mock( '../../../hooks/use-create-page', () => ( {
	__esModule: true,
	default: jest.fn( () => ( { create: jest.fn(), isLoading: false } ) ),
} ) );

jest.mock( '../../../hooks/use-user', () => ( {
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

describe( '@elementor/recently-edited - Top bar add new page', () => {
	beforeEach( () => {
		jest.mocked( useActiveDocument ).mockReturnValue( createMockDocument() );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render add new page button', () => {
		// Arrange.
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
		const label = screen.getByText( 'Add new page', { exact: false } );
		expect( label ).toBeInTheDocument();
	} );

	it( 'should trigger create page hook on click', async () => {
		// Arrange.
		const isLoading = false;
		const recentPosts: RecentPost[] = [];
		const create = jest.fn().mockReturnValue( Promise.resolve( { id: 123 } ) );
		const navigateToDocument = jest.fn();

		jest.mocked( useRecentPosts ).mockReturnValue( { isLoading, data: recentPosts } as ReturnType<
			typeof useRecentPosts
		> );
		jest.mocked( useCreatePage ).mockReturnValue( { isLoading, create } );
		jest.mocked( useNavigateToDocument ).mockReturnValue( navigateToDocument );

		renderWithTheme( <RecentlyEdited /> );

		// Act.
		const buttons = screen.getAllByRole( 'button' );
		fireEvent.click( buttons[ 0 ] ); // Opens the recently edited menu

		const addNewPage = screen.getByText( 'Add new page', { exact: false } );
		fireEvent.click( addNewPage );

		// Assert.
		expect( create ).toHaveBeenCalledTimes( 1 );

		await waitFor( () => expect( navigateToDocument ).toHaveBeenCalledTimes( 1 ) );

		expect( navigateToDocument ).toHaveBeenCalledWith( 123 );
	} );

	it( 'should be disabled if user does not have edit_posts capability', () => {
		// Arrange.
		jest.mocked( useUser ).mockReturnValue( {
			isLoading: false,
			data: {
				capabilities: {
					edit_pages: false,
				},
			},
		} as unknown as ReturnType< typeof useUser > );

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
		const addNewPage = screen.getByRole( 'menuitem', { name: /Add new page/i } );
		expect( addNewPage ).toHaveAttribute( 'aria-disabled', 'true' );
	} );
} );
