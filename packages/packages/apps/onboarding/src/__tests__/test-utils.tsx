import * as React from 'react';
import { __deleteStore } from '@elementor/store';
import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import { App } from '../components/app';
import { DEFAULT_STRINGS } from '../utils/default-strings';

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
	shouldShowProInstallScreen?: boolean;
	userName?: string;
	strings?: Record< string, string >;
	urls: {
		dashboard: string;
		editor: string;
		connect: string;
		comparePlans?: string;
		exploreFeatures?: string;
	};
}

const DEFAULT_STEPS = [
	{ id: 'building_for', label: 'Who are you building for?', type: 'single' as const },
	{ id: 'site_about', label: 'What is your site about?', type: 'multiple' as const },
	{ id: 'experience_level', label: 'Experience level', type: 'single' as const },
	{ id: 'theme_selection', label: 'Theme selection', type: 'single' as const },
	{ id: 'site_features', label: 'Site features', type: 'multiple' as const },
];

export const DEFAULT_TEST_URLS = {
	exploreFeatures: 'https://elementor.com/features/?utm_source=onboarding&utm_medium=wp-dash',
	comparePlans: 'https://elementor.com/pricing/?utm_source=onboarding&utm_medium=wp-dash',
} as const;

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
	shouldShowProInstallScreen: false,
	urls: {
		dashboard: 'https://test.local/wp-admin/',
		editor: 'https://test.local/editor',
		connect: 'https://test.local/connect',
		...DEFAULT_TEST_URLS,
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
