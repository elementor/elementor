import * as React from 'react';
import { __deleteStore } from '@elementor/store';
import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import { App } from '../components/app';

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

export const mockFetch = jest.fn();
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
	strings?: Record< string, string >;
	urls: {
		dashboard: string;
		editor: string;
		connect: string;
	};
}

const DEFAULT_STEPS = [
	{ id: 'building_for', label: 'Who are you building for?', type: 'single' as const },
	{ id: 'site_about', label: 'What is your site about?', type: 'multiple' as const },
	{ id: 'experience_level', label: 'Experience level', type: 'single' as const },
	{ id: 'theme_selection', label: 'Theme selection', type: 'single' as const },
	{ id: 'site_features', label: 'Site features', type: 'multiple' as const },
];

const DEFAULT_STRINGS: Record< string, string > = {
	'common.continue': 'Continue',
	'common.skip': 'Skip',
	'common.back': 'Back',
	'common.finish': 'Finish',
	'common.loading': 'Loading\u2026',
	'common.upgrade': 'Upgrade',
	'common.close_onboarding': 'Close onboarding',
	'common.or': 'OR',
	'common.installed': 'Installed',
	'common.recommended': 'Recommended',
	'error.failed_mark_exit': 'Failed to mark user exit.',
	'error.failed_complete_step': 'Failed to complete step.',
	'login.title': "Let's get to work.",
	'login.sign_in': 'Sign in to Elementor',
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
	'steps.site_about.option_small_business': 'Small business',
	'steps.site_about.option_online_store': 'Online store',
	'steps.site_about.option_company_site': 'Company site',
	'steps.site_about.option_blog': 'Blog',
	'steps.site_about.option_landing_page': 'Landing page',
	'steps.site_about.option_booking': 'Booking',
	'steps.site_about.option_portfolio': 'Portfolio',
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
};

const defaultConfig: OnboardingConfig = {
	version: '1.0.0',
	restUrl: 'https://test.local/wp-json/elementor/v1/e-onboarding/',
	nonce: 'test-nonce',
	steps: DEFAULT_STEPS,
	strings: DEFAULT_STRINGS,
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

export const createMockConfig = ( overrides: ConfigOverrides = {} ): { 'e-onboarding': OnboardingConfig } => ( {
	'e-onboarding': {
		...defaultConfig,
		...overrides,
		progress: {
			...defaultConfig.progress,
			...overrides.progress,
		},
	},
} );

export function setupOnboardingTests() {
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
}

export function renderApp( overrides: ConfigOverrides = {} ) {
	window.elementorAppConfig = createMockConfig( overrides );
	return render( <App /> );
}
