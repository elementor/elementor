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
		current_step_id: 'site_about',
		current_step_index: 1,
		completed_steps: [ 'building_for' ],
	},
	choices: { building_for: 'myself' },
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
		choices: {
			...defaultConfig.choices,
			...overrides.choices,
		},
	},
} );

describe( 'SiteAbout', () => {
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

	describe( 'Greeting banner', () => {
		it( 'should show correct greeting for "myself" choice', () => {
			window.elementorAppConfig = createMockConfig( {
				choices: { building_for: 'myself' },
			} );

			render( <App /> );

			expect( screen.getByTestId( 'site-about-step' ) ).toBeInTheDocument();
			expect( screen.getByText( "Got it! We'll keep things simple." ) ).toBeInTheDocument();
		} );

		it( 'should show correct greeting for "business" choice', () => {
			window.elementorAppConfig = createMockConfig( {
				choices: { building_for: 'business' },
			} );

			render( <App /> );

			expect( screen.getByText( "Great! Let's set up your business site." ) ).toBeInTheDocument();
		} );

		it( 'should show correct greeting for "client" choice', () => {
			window.elementorAppConfig = createMockConfig( {
				choices: { building_for: 'client' },
			} );

			render( <App /> );

			expect( screen.getByText( "Nice! Let's create something for your client." ) ).toBeInTheDocument();
		} );

		it( 'should show correct greeting for "exploring" choice', () => {
			window.elementorAppConfig = createMockConfig( {
				choices: { building_for: 'exploring' },
			} );

			render( <App /> );

			expect( screen.getByText( "Got it! We'll keep things simple." ) ).toBeInTheDocument();
		} );

		it( 'should show fallback greeting when building_for is unrecognised', () => {
			window.elementorAppConfig = createMockConfig( {
				choices: { building_for: 'unknown_value' },
			} );

			render( <App /> );

			expect( screen.getByText( "Let's get started!" ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Option rendering', () => {
		it( 'should render all 8 site-about options', () => {
			window.elementorAppConfig = createMockConfig();

			render( <App /> );

			expect( screen.getByText( 'Small business' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Online store' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Company site' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Blog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Landing page' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Booking' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Portfolio' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Other' ) ).toBeInTheDocument();
		} );

		it( 'should render the step title and subtitle', () => {
			window.elementorAppConfig = createMockConfig();

			render( <App /> );

			expect( screen.getByText( 'What is your site about?' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Choose anything that applies.' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Multi-select behavior', () => {
		it( 'should toggle selection on click', () => {
			window.elementorAppConfig = createMockConfig();

			render( <App /> );

			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );

			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'false' );

			fireEvent.click( blogButton );

			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );

		it( 'should allow multiple selections', () => {
			window.elementorAppConfig = createMockConfig();

			render( <App /> );

			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );
			const portfolioButton = screen.getByRole( 'button', { name: 'Portfolio' } );

			fireEvent.click( blogButton );
			fireEvent.click( portfolioButton );

			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( portfolioButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );

		it( 'should deselect on second click', () => {
			window.elementorAppConfig = createMockConfig();

			render( <App /> );

			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );

			fireEvent.click( blogButton );
			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );

			fireEvent.click( blogButton );
			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );

		it( 'should enable Continue button when at least one option is selected', () => {
			window.elementorAppConfig = createMockConfig();

			render( <App /> );

			const continueButton = screen.getByRole( 'button', { name: 'Continue' } );

			expect( continueButton ).toBeDisabled();

		fireEvent.click( screen.getByRole( 'button', { name: 'Blog' } ) );

		expect( continueButton ).toBeEnabled();
		} );
	} );

	describe( 'Pre-selected state', () => {
		it( 'should show previously selected options from saved choices', () => {
			window.elementorAppConfig = createMockConfig( {
				choices: {
					building_for: 'myself',
					site_about: [ 'blog', 'portfolio' ],
				},
			} );

			render( <App /> );

			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );
			const portfolioButton = screen.getByRole( 'button', { name: 'Portfolio' } );
			const otherButton = screen.getByRole( 'button', { name: 'Other' } );

			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( portfolioButton ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( otherButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );
	} );

	describe( 'Continue and Skip', () => {
		it( 'should call user-progress API when clicking Continue', async () => {
			window.elementorAppConfig = createMockConfig();

			render( <App /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Blog' } ) );
			fireEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'user-choices' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'blog' ),
					} )
				);
			} );
		} );

		it( 'should call user-progress API when clicking Skip', async () => {
			window.elementorAppConfig = createMockConfig();

			render( <App /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Skip' } ) );

			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'user-progress' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'skip_step' ),
					} )
				);
			} );
		} );
	} );
} );
