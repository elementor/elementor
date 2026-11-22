import * as React from 'react';
import { renderWithQuery } from 'test-utils';
import { screen } from '@testing-library/react';

import useUser from '../../../hooks/use-user';
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

jest.mock( '../../../env', () => ( {
	env: {
		can_access_site_content_panel: true,
		is_pages_panel_active: true,
	},
} ) );

jest.mock( '../../../hooks/use-user', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const mockUseUser = jest.mocked( useUser );

describe( 'Shell', () => {
	afterEach( () => {
		const { env } = jest.requireMock( '../../../env' ) as {
			env: { can_access_site_content_panel: boolean };
		};
		env.can_access_site_content_panel = true;
	} );

	it( 'shows a loading skeleton while user capabilities are pending', () => {
		mockUseUser.mockReturnValue( {
			isPending: true,
			isError: false,
			data: undefined,
		} as ReturnType< typeof useUser > );

		renderWithQuery( <Shell /> );

		expect( screen.getByTestId( 'site-content-user-skeleton' ) ).toBeInTheDocument();
	} );

	it( 'renders only post sections the user can access', () => {
		mockUseUser.mockReturnValue( {
			isPending: false,
			isError: false,
			data: {
				capabilities: {
					edit_posts: true,
				},
			},
		} as ReturnType< typeof useUser > );

		renderWithQuery( <Shell /> );

		expect( screen.getByText( 'Posts' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Pages' ) ).not.toBeInTheDocument();
	} );

	it( 'opens the first accessible section by default', () => {
		mockUseUser.mockReturnValue( {
			isPending: false,
			isError: false,
			data: {
				capabilities: {
					edit_posts: true,
				},
			},
		} as ReturnType< typeof useUser > );

		renderWithQuery( <Shell /> );

		expect( screen.getByRole( 'button', { name: 'Posts (0)' } ) ).toBeInTheDocument();
	} );

	it( 'falls back to all sections when user capabilities fail to load but the env gate allows access', () => {
		mockUseUser.mockReturnValue( {
			isPending: false,
			isError: true,
			data: undefined,
		} as ReturnType< typeof useUser > );

		renderWithQuery( <Shell /> );

		expect( screen.getByText( 'Pages' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Posts' ) ).toBeInTheDocument();
	} );

	it( 'shows an error message when user capabilities fail to load', () => {
		mockUseUser.mockReturnValue( {
			isPending: false,
			isError: true,
			data: undefined,
		} as ReturnType< typeof useUser > );

		const { env } = jest.requireMock( '../../../env' ) as {
			env: { can_access_site_content_panel: boolean };
		};
		env.can_access_site_content_panel = false;

		renderWithQuery( <Shell /> );

		expect(
			screen.getByText( 'We couldn’t load your content permissions. Try closing and reopening this panel.' )
		).toBeInTheDocument();
	} );
} );