/* eslint-disable testing-library/no-test-id-queries */
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { mockFetch, renderApp, setupOnboardingTests } from '../../../__tests__/test-utils';

const SITE_ABOUT_STEP = {
	progress: { current_step_id: 'site_about', current_step_index: 1, completed_steps: [ 'building_for' ] },
	choices: { building_for: 'myself' },
};

describe( 'SiteAbout', () => {
	setupOnboardingTests();

	describe( 'Greeting banner', () => {
		it( 'should show correct greeting for "myself" choice', () => {
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: { building_for: 'myself' },
			} );

			expect( screen.getByTestId( 'site-about-step' ) ).toBeInTheDocument();
			expect( screen.getByText( "Got it! We'll keep things simple." ) ).toBeInTheDocument();
		} );

		it( 'should show correct greeting for "business" choice', () => {
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: { building_for: 'business' },
			} );

			expect( screen.getByText( "Great! Let's set up your business site." ) ).toBeInTheDocument();
		} );

		it( 'should show correct greeting for "client" choice', () => {
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: { building_for: 'client' },
			} );

			expect( screen.getByText( "Nice! Let's create something for your client." ) ).toBeInTheDocument();
		} );

		it( 'should show correct greeting for "exploring" choice', () => {
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: { building_for: 'exploring' },
			} );

			expect( screen.getByText( "Got it! We'll keep things simple." ) ).toBeInTheDocument();
		} );

		it( 'should show fallback greeting when building_for is unrecognised', () => {
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: { building_for: 'unknown_value' },
			} );

			expect( screen.getByText( "Let's get started!" ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Option rendering', () => {
		it( 'should render all 8 site-about options', () => {
			renderApp( SITE_ABOUT_STEP );

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
			renderApp( SITE_ABOUT_STEP );

			expect( screen.getByText( 'What is your site about?' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Choose anything that applies.' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Multi-select behavior', () => {
		it( 'should toggle selection on click', () => {
			renderApp( SITE_ABOUT_STEP );

			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );

			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'false' );

			fireEvent.click( blogButton );

			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );

		it( 'should allow multiple selections', () => {
			renderApp( SITE_ABOUT_STEP );

			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );
			const portfolioButton = screen.getByRole( 'button', { name: 'Portfolio' } );

			fireEvent.click( blogButton );
			fireEvent.click( portfolioButton );

			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( portfolioButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );

		it( 'should deselect on second click', () => {
			renderApp( SITE_ABOUT_STEP );

			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );

			fireEvent.click( blogButton );
			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );

			fireEvent.click( blogButton );
			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );

		it( 'should enable Continue button when at least one option is selected', () => {
			renderApp( SITE_ABOUT_STEP );

			const continueButton = screen.getByRole( 'button', { name: 'Continue' } );

			expect( continueButton ).toBeDisabled();

			fireEvent.click( screen.getByRole( 'button', { name: 'Blog' } ) );

			expect( continueButton ).toBeEnabled();
		} );
	} );

	describe( 'Pre-selected state', () => {
		it( 'should show previously selected options from saved choices', () => {
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: {
					building_for: 'myself',
					site_about: [ 'blog', 'portfolio' ],
				},
			} );

			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );
			const portfolioButton = screen.getByRole( 'button', { name: 'Portfolio' } );
			const otherButton = screen.getByRole( 'button', { name: 'Other' } );

			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( portfolioButton ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( otherButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );
	} );

	describe( 'Continue and Skip', () => {
		it( 'should call user-choices API when clicking Continue', async () => {
			renderApp( SITE_ABOUT_STEP );

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
			renderApp( SITE_ABOUT_STEP );

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
