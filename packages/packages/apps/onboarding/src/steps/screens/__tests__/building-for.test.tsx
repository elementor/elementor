/* eslint-disable testing-library/no-test-id-queries */
import * as React from 'react';
import { __deleteStore } from '@elementor/store';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { App } from '../../../components/app';

jest.mock( '@elementor/query', () => {
	const actual = jest.requireActual( '@elementor/query' );
	return {
		...actual,
		createQueryClient: () =>
			new QueryClient( {
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						refetchOnReconnect: false,
					},
				},
			} ),
	};
} );

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

interface OnboardingConfig {
	version: string;
	restUrl: string;
	nonce: string;
	steps: Array< {
		id: string;
		label: string;
		type: 'single' | 'multiple';
	} >;
	progress: {
		current_step_id?: string;
		current_step_index?: number;
		completed_steps?: string[];
	};
	choices: Record< string, unknown >;
	hadUnexpectedExit: boolean;
	isConnected: boolean;
	userName?: string;
	urls: {
		dashboard: string;
		editor: string;
		connect: string;
	};
}

const defaultConfig: OnboardingConfig = {
	version: '1.0.0',
	restUrl: 'https://test.local/wp-json/elementor/v1/e-onboarding/',
	nonce: 'test-nonce',
	steps: [
		{
			id: 'building_for',
			label: 'Who are you building for?',
			type: 'single',
		},
		{
			id: 'site_about',
			label: 'What is your site about?',
			type: 'multiple',
		},
		{
			id: 'experience_level',
			label: 'Experience level',
			type: 'single',
		},
		{
			id: 'theme_selection',
			label: 'Theme selection',
			type: 'single',
		},
		{
			id: 'site_features',
			label: 'Site features',
			type: 'multiple',
		},
	],
	progress: {
		current_step_id: 'building_for',
		current_step_index: 0,
		completed_steps: [],
	},
	choices: {},
	hadUnexpectedExit: false,
	isConnected: true,
	urls: {
		dashboard: 'https://test.local/wp-admin/',
		editor: 'https://test.local/editor',
		connect: 'https://test.local/connect',
	},
};

type ConfigOverrides = Partial< OnboardingConfig >;

const createMockConfig = ( overrides: ConfigOverrides = {} ): { 'e-onboarding': OnboardingConfig } => ( {
	'e-onboarding': {
		...defaultConfig,
		...overrides,
		progress: {
			...defaultConfig.progress,
			...overrides.progress,
		},
	},
} );

describe( 'BuildingFor', () => {
	beforeEach( () => {
		__deleteStore();
		mockFetch.mockReset();
		mockFetch.mockResolvedValue( {
			ok: true,
			json: () => Promise.resolve( { success: true } ),
		} );
	} );

	afterEach( () => {
		window.elementorAppConfig = undefined;
		__deleteStore();
	} );

	describe( 'Greeting text', () => {
		it( 'should show greeting without name for guest user', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: false,
			} );

			render( <App /> );

			// Act - continue as guest to reach the building_for step
			fireEvent.click( screen.getByText( 'Continue as a guest' ) );

			// Assert
			expect( screen.getByTestId( 'building-for-step' ) ).toBeInTheDocument();
			expect( screen.getByText( /Hey.*Let's get your site set up\./i ) ).toBeInTheDocument();
		} );

		it( 'should show greeting without name when connected user has no userName', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				userName: '',
			} );

			// Act
			render( <App /> );

			// Assert
			expect( screen.getByTestId( 'building-for-step' ) ).toBeInTheDocument();
			expect( screen.getByText( /Hey.*Let's get your site set up\./i ) ).toBeInTheDocument();
		} );

		it( 'should show greeting with name when connected user has userName', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				userName: 'John',
			} );

			// Act
			render( <App /> );

			// Assert
			expect( screen.getByTestId( 'building-for-step' ) ).toBeInTheDocument();
			expect( screen.getByText( /Hey John.*Let's get your site set up\./i ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Option rendering', () => {
		it( 'should render all building_for options', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
			} );

			// Act
			render( <App /> );

			// Assert
			expect( screen.getByText( 'Myself or someone I know' ) ).toBeInTheDocument();
			expect( screen.getByText( 'My business or workplace' ) ).toBeInTheDocument();
			expect( screen.getByText( 'A client' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Just exploring' ) ).toBeInTheDocument();
		} );

		it( 'should render the step title', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
			} );

			// Act
			render( <App /> );

			// Assert
			expect( screen.getByText( 'Who are you building for?' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Selection behavior', () => {
		it( 'should call API with correct value when selecting an option', async () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
			} );

			render( <App /> );

			// Act
			fireEvent.click( screen.getByText( 'Myself or someone I know' ) );

			// Assert - should call user-choices API with building_for value
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'user-choices' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'myself' ),
					} )
				);
			} );
		} );

		it( 'should navigate to next step after successful selection', async () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
			} );

			render( <App /> );

			// Act
			fireEvent.click( screen.getByText( 'A client' ) );

			// Assert - should call user-progress API (complete_step) after choices are saved
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'user-progress' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'complete_step' ),
					} )
				);
			} );
		} );

		it( 'should call API with correct value for different options', async () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
			} );

			render( <App /> );

			// Act
			fireEvent.click( screen.getByText( 'Just exploring' ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'user-choices' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'exploring' ),
					} )
				);
			} );
		} );
	} );

	describe( 'Pre-selected state', () => {
		it( 'should show previously selected option from saved choices', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				choices: { building_for: 'business' },
			} );

			// Act
			render( <App /> );

			// Assert - the business option should be pressed
			const businessButton = screen.getByRole( 'button', { name: 'My business or workplace' } );
			expect( businessButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );
	} );
} );
