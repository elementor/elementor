import * as React from 'react';
import { renderWithQuery } from 'test-utils';
import { screen } from '@testing-library/react';

import useAccessiblePanelPostTypes from '../../../hooks/use-accessible-panel-post-types';
import Shell from '../shell';

jest.mock( '../../../hooks/use-posts', () => ( {
	usePosts: jest.fn( () => ( {
		isPending: false,
		isError: false,
		data: { posts: [], total: 0 },
		fetchNextPage: jest.fn(),
		hasNextPage: false,
		isFetchingNextPage: false,
	} ) ),
} ) );

jest.mock( '../../../hooks/use-homepage', () => ( {
	useHomepage: jest.fn( () => ( {
		isLoading: false,
		data: undefined,
	} ) ),
} ) );

jest.mock( '../../../hooks/use-user', () => ( {
	__esModule: true,
	default: jest.fn( () => ( {
		isPending: false,
		isError: false,
		data: { capabilities: { edit_pages: true, edit_posts: true } },
	} ) ),
} ) );

jest.mock( '../../../hooks/use-accessible-panel-post-types', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const mockUseAccessiblePanelPostTypes = jest.mocked( useAccessiblePanelPostTypes );

describe( 'Shell', () => {
	beforeEach( () => {
		mockUseAccessiblePanelPostTypes.mockReturnValue( {
			accessiblePostTypes: [ 'page', 'post' ],
			isUserPending: false,
			showUserLoadError: false,
		} );
	} );

	it( 'shows no sections while user capabilities are pending', () => {
		mockUseAccessiblePanelPostTypes.mockReturnValue( {
			accessiblePostTypes: [],
			isUserPending: true,
			showUserLoadError: false,
		} );

		renderWithQuery( <Shell /> );

		expect( screen.queryByPlaceholderText( 'Search' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Pages' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Posts' ) ).not.toBeInTheDocument();
	} );

	it( 'renders only post sections the user can access', () => {
		mockUseAccessiblePanelPostTypes.mockReturnValue( {
			accessiblePostTypes: [ 'post' ],
			isUserPending: false,
			showUserLoadError: false,
		} );

		renderWithQuery( <Shell /> );

		expect( screen.getByText( 'Posts' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Pages' ) ).not.toBeInTheDocument();
	} );

	it( 'opens the first accessible section by default', () => {
		mockUseAccessiblePanelPostTypes.mockReturnValue( {
			accessiblePostTypes: [ 'post' ],
			isUserPending: false,
			showUserLoadError: false,
		} );

		renderWithQuery( <Shell /> );

		expect( screen.getByRole( 'button', { name: 'Posts (0)' } ) ).toBeInTheDocument();
		expect( screen.getByPlaceholderText( 'Search' ) ).toBeInTheDocument();
	} );

	it( 'falls back to all sections when user capabilities fail to load but the env gate allows access', () => {
		mockUseAccessiblePanelPostTypes.mockReturnValue( {
			accessiblePostTypes: [ 'page', 'post' ],
			isUserPending: false,
			showUserLoadError: false,
		} );

		renderWithQuery( <Shell /> );

		expect( screen.getByText( 'Pages' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Posts' ) ).toBeInTheDocument();
	} );

	it( 'shows an error message when user capabilities fail to load', () => {
		mockUseAccessiblePanelPostTypes.mockReturnValue( {
			accessiblePostTypes: [],
			isUserPending: false,
			showUserLoadError: true,
		} );

		renderWithQuery( <Shell /> );

		expect(
			screen.getByText( 'We couldn’t load your content permissions. Try closing and reopening this panel.' )
		).toBeInTheDocument();
	} );
} );
