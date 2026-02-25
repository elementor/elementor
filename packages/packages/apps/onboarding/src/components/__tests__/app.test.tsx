/* eslint-disable testing-library/no-test-id-queries */
import * as React from 'react';
import { __deleteStore } from '@elementor/store';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { DEFAULT_STRINGS } from '../../utils/default-strings';
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
	translations?: Record< string, string >;
	shouldShowProInstallScreen?: boolean;
	urls: {
		dashboard: string;
		editor: string;
		connect: string;
		comparePlans?: string;
		exploreFeatures?: string;
		createNewPage?: string;
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
	translations: DEFAULT_STRINGS,
	progress: {
		current_step_id: 'building_for',
		current_step_index: 0,
		completed_steps: [],
	},
	choices: {},
	hadUnexpectedExit: false,
	isConnected: false,
	shouldShowProInstallScreen: false,
	urls: {
		dashboard: 'https://test.local/wp-admin/',
		editor: 'https://test.local/editor',
		connect: 'https://test.local/connect',
		comparePlans: 'https://elementor.com/pricing/?utm_source=onboarding&utm_medium=wp-dash',
		exploreFeatures: 'https://elementor.com/features/?utm_source=onboarding&utm_medium=wp-dash',
		createNewPage: 'https://test.local/wp-admin/edit.php?action=elementor_new_post&post_type=page',
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

		it( 'should skip login screen when user is already connected', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
			} );

			// Act
			render( <App /> );

			// Assert - should go straight to steps, no login screen
			expect( screen.queryByTestId( 'login-screen' ) ).not.toBeInTheDocument();
			expect( screen.getByTestId( 'onboarding-steps' ) ).toBeInTheDocument();
		} );

		it( 'should return guest user to login screen when clicking Back on first step', async () => {
			// Arrange - user is not connected (guest flow)
			window.elementorAppConfig = createMockConfig( {
				isConnected: false,
			} );

			render( <App /> );

			// First, continue as guest to get past login
			fireEvent.click( screen.getByText( 'Continue as a guest' ) );

			await waitFor( () => {
				expect( screen.getByTestId( 'onboarding-steps' ) ).toBeInTheDocument();
			} );

			// Act - click Back on first step
			fireEvent.click( screen.getByText( 'Back' ) );

			// Assert - guest should return to login screen
			await waitFor( () => {
				expect( screen.getByTestId( 'login-screen' ) ).toBeInTheDocument();
			} );
		} );

		it( 'should NOT return connected user to login screen when clicking Back on first step', () => {
			// Arrange - user is genuinely connected
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
			} );

			render( <App /> );

			// Act - click Back on first step
			fireEvent.click( screen.getByText( 'Back' ) );

			// Assert - connected user should stay on steps (hasPassedLogin still true via isConnected)
			expect( screen.queryByTestId( 'login-screen' ) ).not.toBeInTheDocument();
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
				choices: { building_for: 'myself' },
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
			expect( screen.getByText( 'Continue with Free' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Skip' ) ).toBeInTheDocument();
		} );

		it( 'should redirect to createNewPage URL with complete:true when finishing last step', async () => {
			// Arrange
			let capturedHref = '';
			Object.defineProperty( window, 'location', {
				writable: true,
				value: {
					...window.location,
					set href( url: string ) {
						capturedHref = url;
					},
				},
			} );

			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				choices: { site_features: [ 'contact_form' ] },
				progress: {
					current_step_id: 'site_features',
					current_step_index: 4,
					completed_steps: [ 'building_for', 'site_about', 'experience_level', 'theme_selection' ],
				},
			} );

			render( <App /> );

			// Act
			fireEvent.click( screen.getByText( 'Continue with Free' ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'user-progress' ),
					expect.objectContaining( {
						body: expect.stringContaining( '"complete":true' ),
					} )
				);
			} );

			await waitFor( () => {
				expect( capturedHref ).toContain( 'elementor_new_post' );
			} );
		} );
	} );

	describe( 'Pro install flow', () => {
		it( 'should show Pro install screen when connected and eligible', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				shouldShowProInstallScreen: true,
			} );

			// Act
			render( <App /> );

			// Assert
			expect( screen.getByTestId( 'pro-install-screen' ) ).toBeInTheDocument();
			expect( screen.getByText( 'You already have a Pro subscription' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Install Pro on this site' ) ).toBeInTheDocument();
			expect( screen.getByText( "I'll do it later" ) ).toBeInTheDocument();
		} );

		it( 'should skip Pro install screen when not eligible', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				shouldShowProInstallScreen: false,
			} );

			// Act
			render( <App /> );

			// Assert
			expect( screen.queryByTestId( 'pro-install-screen' ) ).not.toBeInTheDocument();
			expect( screen.getByTestId( 'onboarding-steps' ) ).toBeInTheDocument();
		} );

		it( 'should not show Pro install screen for guest users', () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: false,
				shouldShowProInstallScreen: true,
			} );

			render( <App /> );

			// Act - continue as guest
			fireEvent.click( screen.getByText( 'Continue as a guest' ) );

			// Assert - should go to steps, not pro install (guests are not connected)
			expect( screen.queryByTestId( 'pro-install-screen' ) ).not.toBeInTheDocument();
			expect( screen.getByTestId( 'onboarding-steps' ) ).toBeInTheDocument();
		} );

		it( 'should dismiss Pro install screen when clicking "I\'ll do it later"', async () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				shouldShowProInstallScreen: true,
			} );

			render( <App /> );
			expect( screen.getByTestId( 'pro-install-screen' ) ).toBeInTheDocument();

			// Act
			fireEvent.click( screen.getByText( "I'll do it later" ) );

			// Assert - should navigate to onboarding steps
			await waitFor( () => {
				expect( screen.queryByTestId( 'pro-install-screen' ) ).not.toBeInTheDocument();
			} );
			expect( screen.getByTestId( 'onboarding-steps' ) ).toBeInTheDocument();
		} );

		it( 'should call install-pro endpoint when clicking install button', async () => {
			// Arrange
			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				shouldShowProInstallScreen: true,
			} );

			render( <App /> );

			// Act
			fireEvent.click( screen.getByText( 'Install Pro on this site' ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'install-pro' ),
					expect.objectContaining( {
						method: 'POST',
					} )
				);
			} );
		} );

		it( 'should dismiss Pro install screen after successful installation', async () => {
			// Arrange
			mockFetch.mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { data: { success: true, message: 'installed' } } ),
			} );

			window.elementorAppConfig = createMockConfig( {
				isConnected: true,
				shouldShowProInstallScreen: true,
			} );

			render( <App /> );

			// Act
			fireEvent.click( screen.getByText( 'Install Pro on this site' ) );

			// Assert - should transition to onboarding steps
			await waitFor( () => {
				expect( screen.queryByTestId( 'pro-install-screen' ) ).not.toBeInTheDocument();
			} );
			expect( screen.getByTestId( 'onboarding-steps' ) ).toBeInTheDocument();
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
