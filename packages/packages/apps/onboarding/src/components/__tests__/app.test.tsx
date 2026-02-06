/* eslint-disable testing-library/no-test-id-queries */
import * as React from 'react';
import { __deleteStore } from '@elementor/store';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { App } from '../app';

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
	isConnected: false,
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

describe( 'App', () => {
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

	describe( 'Login flow', () => {
		it( 'should show Login screen when user is not connected', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: false,
			} );

			// Act
			render( <App /> );

			// Assert
			expect( screen.getByTestId( 'login-screen' ) ).toBeInTheDocument();
		} );

		it( 'should navigate to first step after clicking "Continue as a guest"', async () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: false,
			} );

			render( <App /> );

			// Act
			fireEvent.click( screen.getByText( 'Continue as a guest' ) );

			// Assert - should now show the onboarding steps, not login
			await waitFor( () => {
				expect( screen.queryByTestId( 'login-screen' ) ).not.toBeInTheDocument();
			} );
			expect( screen.getByTestId( 'onboarding-steps' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Step navigation', () => {
		it( 'should show onboarding steps when user is connected', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
			} );

			// Act
			render( <App /> );

			// Assert
			expect( screen.getByTestId( 'onboarding-steps' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Continue' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Skip' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Back' ) ).toBeInTheDocument();
		} );

		it( 'should call API when clicking Continue', async () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
			} );

			render( <App /> );

			// Act
			fireEvent.click( screen.getByText( 'Continue' ) );

			// Assert - API should be called with complete_step
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

		it( 'should go back to login screen when clicking Back on first step', async () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
			} );

			render( <App /> );

			// Act
			fireEvent.click( screen.getByText( 'Back' ) );

			// Assert - should return to login screen
			await waitFor( () => {
				expect( screen.getByTestId( 'login-screen' ) ).toBeInTheDocument();
			} );
		} );

		it( 'should show "Finish" button on last step', () => {
			// Arrange - start on last step
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				progress: {
					current_step_id: 'site_features',
					current_step_index: 4,
					completed_steps: [ 'building_for', 'site_about', 'experience_level', 'theme_selection' ],
				},
			} );

			// Act
			render( <App /> );

			// Assert
			expect( screen.getByText( 'Finish' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Skip' ) ).not.toBeInTheDocument();
		} );

		it( 'should call onComplete when finishing last step', async () => {
			// Arrange
			const onComplete = jest.fn();
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				progress: {
					current_step_id: 'site_features',
					current_step_index: 4,
					completed_steps: [ 'building_for', 'site_about', 'experience_level', 'theme_selection' ],
				},
			} );

			render( <App onComplete={ onComplete } /> );

			// Act
			fireEvent.click( screen.getByText( 'Finish' ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalled();
			} );

			await waitFor( () => {
				expect( onComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'Progress restoration', () => {
		it( 'should restore user to saved step index', () => {
			// Arrange - user was on step 2
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				progress: {
					current_step_id: 'experience_level',
					current_step_index: 2,
					completed_steps: [ 'building_for', 'site_about' ],
				},
			} );

			// Act
			render( <App /> );

			// Assert - should show onboarding steps, not login
			expect( screen.getByTestId( 'onboarding-steps' ) ).toBeInTheDocument();
			// And Skip should be visible since we're not on last step
			expect( screen.getByText( 'Skip' ) ).toBeInTheDocument();
		} );
	} );
} );
