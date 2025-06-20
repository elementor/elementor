import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import useUser from '../../../../../hooks/use-user';
import { type Post } from '../../../../../types';
import SetHome from '../set-home';

const mockMutateAsync = jest.fn();
jest.mock( '../../../../../hooks/use-homepage-actions', () => ( {
	__esModule: true,
	useHomepageActions: jest.fn( () => ( {
		updateSettingsMutation: {
			mutateAsync: mockMutateAsync,
			isPending: false,
		},
	} ) ),
} ) );

jest.mock( '../../../../../hooks/use-user', () => ( {
	default: jest.fn( () => ( {
		isLoading: false,
		data: {
			capabilities: {
				manage_options: true,
			},
		},
	} ) ),
	__esModule: true,
} ) );

describe( '@elementor/editor-site-navigation - SetHome', () => {
	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'should render Set as homepage', () => {
		// Arrange.
		const post: Post = {
			id: 1,
			title: {
				rendered: 'Test Page',
			},
			status: 'publish',
			type: 'page',
			link: 'https://example.local/test-page',
			isHome: false,
			user_can: {
				edit: true,
				delete: true,
			},
		};

		// Act.
		renderWithTheme( <SetHome post={ post } closeMenu={ () => {} } /> );

		// Assert.
		const button = screen.getByRole( 'menuitem' );
		expect( button ).not.toHaveAttribute( 'aria-disabled' );

		fireEvent.click( button );

		expect( mockMutateAsync ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should render Set as homepage disabled when the page status is draft', () => {
		// Arrange.
		const post: Post = {
			id: 1,
			title: {
				rendered: 'Test Page',
			},
			status: 'draft',
			type: 'page',
			link: 'https://example.local/test-page',
			isHome: false,
			user_can: {
				edit: true,
				delete: true,
			},
		};

		// Act.
		renderWithTheme( <SetHome post={ post } closeMenu={ () => {} } /> );

		// Assert.
		const button = screen.getByRole( 'menuitem' );
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'should render Set as homepage disabled when the user cant manage options', () => {
		// Arrange.
		jest.mocked( useUser ).mockReturnValue( {
			isLoading: false,
			data: {
				capabilities: {
					manage_options: false,
				},
			},
		} as unknown as ReturnType< typeof useUser > );

		const post: Post = {
			id: 1,
			title: {
				rendered: 'Test Page',
			},
			status: 'publish',
			type: 'page',
			link: 'https://example.local/test-page',
			isHome: false,
			user_can: {
				edit: true,
				delete: true,
			},
		};

		// Act.
		renderWithTheme( <SetHome post={ post } closeMenu={ () => {} } /> );

		// Assert.
		const button = screen.getByRole( 'menuitem' );
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
	} );
} );
