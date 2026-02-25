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
	strings?: Record< string, string >;
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
	strings: {
		'common.continue': 'Continue',
		'common.skip': 'Skip',
		'common.back': 'Back',
		'common.finish': 'Finish',
		'common.loading': 'Loading\u2026',
		'common.upgrade': 'Upgrade',
		'common.close_onboarding': 'Close onboarding',
		'common.installed': 'Installed',
		'common.recommended': 'Recommended',
		'error.failed_mark_exit': 'Failed to mark user exit.',
		'error.failed_complete_step': 'Failed to complete step.',
		'login.title': "Let's get to work.",
		'login.sign_in': 'Sign in to Elementor',
		'login.or': 'OR',
		'login.continue_another_way': 'Continue another way',
		'login.continue_as_guest': 'Continue as a guest',
		'steps.building_for.title': 'Who are you building for?',
		'steps.building_for.greeting_with_name': "Hey %1$s %2$s Let's get your site set up.",
		'steps.building_for.greeting_without_name': "Hey%s Let's get your site set up.",
		'steps.building_for.option_myself': 'Myself or someone I know',
		'steps.building_for.option_business': 'My business or workplace',
		'steps.building_for.option_client': 'A client',
		'steps.building_for.option_exploring': 'Just exploring',
		'steps.site_about.title': 'What is your site about?',
		'steps.site_about.subtitle': 'Choose anything that applies.',
		'steps.site_about.option_small_med_business': 'Small-Med Business',
		'steps.site_about.option_online_store': 'Online store',
		'steps.site_about.option_company_site': 'Company site',
		'steps.site_about.option_blog': 'Blog',
		'steps.site_about.option_landing_page': 'Landing page',
		'steps.site_about.option_booking': 'Booking',
		'steps.site_about.option_organization': 'Organization',
		'steps.site_about.option_other': 'Other',
		'steps.site_about.greeting_myself': "Got it! We'll keep things simple.",
		'steps.site_about.greeting_business': "Great! Let's set up your business site.",
		'steps.site_about.greeting_client': "Nice! Let's create something for your client.",
		'steps.site_about.greeting_fallback': "Let's get started!",
		'steps.experience_level.title': 'How much experience do you have with Elementor?',
		'steps.experience_level.subtitle': 'This helps us adjust the editor to your workflow.',
		'steps.experience_level.option_beginner': "I'm just getting started",
		'steps.experience_level.option_intermediate': 'I have some experience',
		'steps.experience_level.option_advanced': "I'm very comfortable with Elementor",
		'steps.theme_selection.title': 'Start with a theme that fits your needs',
		'steps.theme_selection.subtitle': 'Hello themes are built to work seamlessly with Elementor.',
		'steps.theme_selection.aria_label': 'Theme selection',
		'steps.theme_selection.theme_hello_label': 'Hello',
		'steps.theme_selection.theme_hello_description': 'A flexible canvas theme you can shape from the ground up',
		'steps.theme_selection.theme_hello_biz_label': 'Hello Biz',
		'steps.theme_selection.theme_hello_biz_description': 'A ready-to-start theme with smart layouts and widgets',
		'steps.theme_selection.greeting_beginner': "Glad you're here!",
		'steps.theme_selection.greeting_default': "Great. Let's take it to the next step",
		'steps.theme_selection.continue_with_theme': 'Continue with this theme',
		'steps.site_features.title': 'What do you want to include in your site?',
		'steps.site_features.subtitle': "We'll use this to tailor suggestions for you.",
		'steps.site_features.continue_with_free': 'Continue with Free',
		'steps.site_features.option_classes_variables': 'Classes & variables',
		'steps.site_features.option_core_placeholder': 'Core placeholder',
		'steps.site_features.option_theme_builder': 'Theme builder',
		'steps.site_features.option_lead_collection': 'Lead Collection',
		'steps.site_features.option_custom_code': 'Custom Code',
		'steps.site_features.option_email_deliverability': 'Email deliverability',
		'steps.site_features.option_ai_generator': 'AI generator',
		'steps.site_features.option_image_optimization': 'Image optimization',
		'steps.site_features.option_accessibility_tools': 'Accessibility tools',
		'steps.site_features.explore_more': 'Explore more',
		'steps.site_features.included': 'Included',
		'steps.site_features.plan_recommendation_prefix': 'Based on the features you chose, we recommend the',
		'steps.site_features.plan_recommendation_suffix': 'plan',
		'steps.site_features.compare_plans': 'Compare plans',
		'pro_install.title': 'You already have a Pro subscription',
		'pro_install.subtitle': 'Would you like to install it on this site now?',
		'pro_install.installing': 'Installing Elementor Pro\u2026',
		'pro_install.installing_short': 'Installing\u2026',
		'pro_install.install_button': 'Install Pro on this site',
		'pro_install.logo_alt': 'Elementor + Elementor Pro',
		'pro_install.do_it_later': "I'll do it later",
		'completion.title': 'Getting things ready',
		'completion.subtitle': 'Tailoring the editor to your goals and workflow\u2026',
	},
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
