/* eslint-disable testing-library/no-test-id-queries */
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { mockFetch, renderApp, setupOnboardingTests } from '../../../__tests__/test-utils';

describe( 'ThemeSelection', () => {
	setupOnboardingTests();

	const navigateToThemeSelection = () => {
		renderApp( {
			isConnected: true,
			progress: { current_step_id: 'theme_selection', current_step_index: 3 },
		} );
	};

	describe( 'Rendering', () => {
		it( 'renders the step heading and updated subtitle', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.getByTestId( 'theme-selection-step' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Start with Hello' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					"Use Elementor's lightweight theme for faster setup and full design control."
				)
			).toBeInTheDocument();
		} );

		it( 'renders the Hello theme card with the by-Elementor label', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
			expect( screen.getByText( 'by Elementor' ) ).toBeInTheDocument();
		} );

		it( 'does not render Hello Biz or a radiogroup', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.queryByText( 'Hello Biz' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'radiogroup' ) ).not.toBeInTheDocument();
			expect( screen.queryAllByRole( 'radio' ) ).toHaveLength( 0 );
		} );

		it( 'shows the Recommended chip on the Hello card', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.getByText( 'Recommended' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Greeting text', () => {
		it( 'shows beginner greeting when experience_level is beginner', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				progress: { current_step_id: 'theme_selection', current_step_index: 3 },
				choices: { experience_level: 'beginner' },
			} );

			// Assert
			expect( screen.getByText( "Glad you're here!" ) ).toBeInTheDocument();
		} );

		it( 'shows default greeting when experience_level is not beginner', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				progress: { current_step_id: 'theme_selection', current_step_index: 3 },
				choices: { experience_level: 'intermediate' },
			} );

			// Assert
			expect( screen.getByText( "Great. Let's take it to the next step" ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Continue behavior', () => {
		it( 'sends hello-elementor on Continue regardless of stored choice', async () => {
			// Arrange
			navigateToThemeSelection();

			// Act
			fireEvent.click( screen.getByText( 'Continue with Hello' ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'user-choices' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'hello-elementor' ),
					} )
				);
			} );
		} );

		it( 'calls install-theme endpoint with hello-elementor on Continue', async () => {
			// Arrange
			navigateToThemeSelection();

			// Act
			fireEvent.click( screen.getByText( 'Continue with Hello' ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'install-theme' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'hello-elementor' ),
					} )
				);
			} );
		} );
	} );

	describe( 'Installed state', () => {
		it( 'shows Installed chip when step is completed and theme is hello-elementor', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				progress: {
					current_step_id: 'theme_selection',
					current_step_index: 3,
					completed_steps: [ 'building_for', 'site_about', 'experience_level', 'theme_selection' ],
				},
				choices: { theme_selection: 'hello-elementor' },
			} );

			// Assert
			expect( screen.getByText( 'Installed' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Recommended' ) ).not.toBeInTheDocument();
		} );
	} );
} );
