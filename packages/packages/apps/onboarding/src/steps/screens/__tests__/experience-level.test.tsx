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
		{ id: 'building_for', label: 'Who are you building for?', type: 'single' },
		{ id: 'site_about', label: 'What is your site about?', type: 'multiple' },
		{ id: 'experience_level', label: 'Experience level', type: 'single' },
		{ id: 'theme_selection', label: 'Theme selection', type: 'single' },
		{ id: 'site_features', label: 'Site features', type: 'multiple' },
	],
	progress: {
		current_step_id: 'experience_level',
		current_step_index: 2,
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

describe( 'ExperienceLevel', () => {
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

	it( 'renders title and subtitle', () => {
		window.elementorAppConfig = createMockConfig( { isConnected: true } );

		render( <App /> );

		expect( screen.getByText( 'How much experience do you have with Elementor?' ) ).toBeInTheDocument();
		expect( screen.getByText( 'This helps us adjust the editor to your workflow.' ) ).toBeInTheDocument();
	} );

	it( 'renders all three options', () => {
		window.elementorAppConfig = createMockConfig( { isConnected: true } );

		render( <App /> );

		expect( screen.getByText( "I'm just getting started" ) ).toBeInTheDocument();
		expect( screen.getByText( 'I have some experience' ) ).toBeInTheDocument();
		expect( screen.getByText( "I'm very comfortable with Elementor" ) ).toBeInTheDocument();
	} );

	it( 'calls API with correct value when selecting an option', async () => {
		window.elementorAppConfig = createMockConfig( { isConnected: true } );

		render( <App /> );

		fireEvent.click( screen.getByText( "I'm just getting started" ) );

		await waitFor( () => {
			expect( mockFetch ).toHaveBeenCalledWith(
				expect.stringContaining( 'user-choices' ),
				expect.objectContaining( {
					method: 'POST',
					body: expect.stringContaining( 'beginner' ),
				} )
			);
		} );
	} );

	it( 'navigates to next step after successful selection', async () => {
		window.elementorAppConfig = createMockConfig( { isConnected: true } );

		render( <App /> );

		fireEvent.click( screen.getByText( "I'm very comfortable with Elementor" ) );

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

	it( 'shows previously selected option from saved choices', () => {
		window.elementorAppConfig = createMockConfig( {
			isConnected: true,
			choices: { experience_level: 'intermediate' },
		} );

		render( <App /> );

		const intermediateButton = screen.getByRole( 'button', { name: 'I have some experience' } );
		expect( intermediateButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );
} );
