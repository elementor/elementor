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
			// Arrange & Act
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: { building_for: 'myself' },
			} );

			// Assert
			expect( screen.getByTestId( 'site-about-step' ) ).toBeInTheDocument();
			expect( screen.getByText( "Got it! We'll keep things simple." ) ).toBeInTheDocument();
		} );

		it( 'should show correct greeting for "business" choice', () => {
			// Arrange & Act
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: { building_for: 'business' },
			} );

			// Assert
			expect( screen.getByText( "Great! Let's set up your business site." ) ).toBeInTheDocument();
		} );

		it( 'should show correct greeting for "client" choice', () => {
			// Arrange & Act
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: { building_for: 'client' },
			} );

			// Assert
			expect( screen.getByText( "Nice! Let's create something for your client." ) ).toBeInTheDocument();
		} );

		it( 'should show correct greeting for "exploring" choice', () => {
			// Arrange & Act
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: { building_for: 'exploring' },
			} );

			// Assert
			expect( screen.getByText( "Got it! We'll keep things simple." ) ).toBeInTheDocument();
		} );

		it( 'should show fallback greeting when building_for is unrecognised', () => {
			// Arrange & Act
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: { building_for: 'unknown_value' },
			} );

			// Assert
			expect( screen.getByText( "Let's get started!" ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Option rendering', () => {
		it( 'should render all 8 site-about options', () => {
			// Arrange & Act
			renderApp( SITE_ABOUT_STEP );

			// Assert
			expect( screen.getByText( 'Small-Med Business' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Online store' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Company site' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Blog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Landing page' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Booking' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Organization' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Other' ) ).toBeInTheDocument();
		} );

		it( 'should render the step title and subtitle', () => {
			// Arrange & Act
			renderApp( SITE_ABOUT_STEP );

			// Assert
			expect( screen.getByText( 'What is your site about?' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Choose anything that applies.' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Multi-select behavior', () => {
		it( 'should toggle selection on click', () => {
			// Arrange
			renderApp( SITE_ABOUT_STEP );
			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );
			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'false' );

			// Act
			fireEvent.click( blogButton );

			// Assert
			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );

		it( 'should allow multiple selections', () => {
			// Arrange
			renderApp( SITE_ABOUT_STEP );
			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );
			const organizationButton = screen.getByRole( 'button', { name: 'Organization' } );

			// Act
			fireEvent.click( blogButton );
			fireEvent.click( organizationButton );

			// Assert
			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( organizationButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );

		it( 'should deselect on second click', () => {
			// Arrange
			renderApp( SITE_ABOUT_STEP );
			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );
			fireEvent.click( blogButton );
			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );

			// Act
			fireEvent.click( blogButton );

			// Assert
			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );

		it( 'should enable Continue button when at least one option is selected', () => {
			// Arrange
			renderApp( SITE_ABOUT_STEP );
			const continueButton = screen.getByRole( 'button', { name: 'Continue' } );
			expect( continueButton ).toBeDisabled();

			// Act
			fireEvent.click( screen.getByRole( 'button', { name: 'Blog' } ) );

			// Assert
			expect( continueButton ).toBeEnabled();
		} );
	} );

	describe( 'Pre-selected state', () => {
		it( 'should show previously selected options from saved choices', () => {
			// Arrange & Act
			renderApp( {
				...SITE_ABOUT_STEP,
				choices: {
					building_for: 'myself',
					site_about: [ 'blog', 'organization' ],
				},
			} );

			// Assert
			const blogButton = screen.getByRole( 'button', { name: 'Blog' } );
			const organizationButton = screen.getByRole( 'button', { name: 'Organization' } );
			const otherButton = screen.getByRole( 'button', { name: 'Other' } );

			expect( blogButton ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( organizationButton ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( otherButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );
	} );

	describe( 'Continue and Skip', () => {
		it( 'should call user-choices API when clicking Continue', async () => {
			// Arrange
			renderApp( SITE_ABOUT_STEP );

			// Act
			fireEvent.click( screen.getByRole( 'button', { name: 'Blog' } ) );
			fireEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			// Assert
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
			// Arrange
			renderApp( SITE_ABOUT_STEP );

			// Act
			fireEvent.click( screen.getByRole( 'button', { name: 'Skip' } ) );

			// Assert
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
