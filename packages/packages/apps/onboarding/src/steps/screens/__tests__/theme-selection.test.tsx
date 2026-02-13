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
		it( 'should render the step heading and description', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.getByTestId( 'theme-selection-step' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Start with a theme that fits your needs' ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'Hello themes are built to work seamlessly with Elementor.' )
			).toBeInTheDocument();
		} );

		it( 'should render the Hello theme card', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'A flexible canvas theme you can shape from the ground up' )
			).toBeInTheDocument();
		} );

		it( 'should render the Hello Biz theme card', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.getByText( 'Hello Biz' ) ).toBeInTheDocument();
			expect( screen.getByText( 'A ready-to-start theme with smart layouts and widgets' ) ).toBeInTheDocument();
		} );

		it( 'should render theme cards as a radiogroup', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.getByRole( 'radiogroup', { name: 'Theme selection' } ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Greeting text', () => {
		it( 'should show beginner greeting when experience_level is beginner', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				progress: { current_step_id: 'theme_selection', current_step_index: 3 },
				choices: { experience_level: 'beginner' },
			} );

			// Assert
			expect( screen.getByText( "Glad you're here!" ) ).toBeInTheDocument();
		} );

		it( 'should show default greeting when experience_level is not beginner', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				progress: { current_step_id: 'theme_selection', current_step_index: 3 },
				choices: { experience_level: 'intermediate' },
			} );

			// Assert
			expect( screen.getByText( "Great. Let's take it to the next step" ) ).toBeInTheDocument();
		} );

		it( 'should show default greeting when experience_level is not set', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.getByText( "Great. Let's take it to the next step" ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Selection behavior', () => {
		it( 'should pre-select the recommended theme (hello-elementor by default)', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			const helloCard = screen.getByRole( 'radio', { name: 'Hello' } );
			expect( helloCard ).toBeChecked();
		} );

		it( 'should allow selecting a different theme', () => {
			// Arrange
			navigateToThemeSelection();

			// Act
			fireEvent.click( screen.getByRole( 'radio', { name: 'Hello Biz' } ) );

			// Assert
			const helloBizCard = screen.getByRole( 'radio', { name: 'Hello Biz' } );
			expect( helloBizCard ).toBeChecked();
		} );

		it( 'should call API with correct value when clicking Continue', async () => {
			// Arrange
			navigateToThemeSelection();

			// Act
			fireEvent.click( screen.getByText( 'Continue with this theme' ) );

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

		it( 'should call progress API with complete_step when clicking Continue', async () => {
			// Arrange
			navigateToThemeSelection();

			// Act
			fireEvent.click( screen.getByText( 'Continue with this theme' ) );

			// Assert
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

		it( 'should send selected theme slug when Hello Biz is selected and Continue is clicked', async () => {
			// Arrange
			navigateToThemeSelection();
			fireEvent.click( screen.getByRole( 'radio', { name: 'Hello Biz' } ) );

			// Act
			fireEvent.click( screen.getByText( 'Continue with this theme' ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'user-choices' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'hello-biz' ),
					} )
				);
			} );
		} );
	} );

	describe( 'Pre-selected state', () => {
		it( 'should show previously selected theme from saved choices', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				progress: { current_step_id: 'theme_selection', current_step_index: 3 },
				choices: { theme_selection: 'hello-biz' },
			} );

			// Assert
			const helloBizCard = screen.getByRole( 'radio', { name: 'Hello Biz' } );
			expect( helloBizCard ).toBeChecked();
		} );
	} );

	describe( 'Installed state', () => {
		it( 'should show Installed chip when step is completed and theme is selected', () => {
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
		} );

		it( 'should NOT show Installed chip when step is not completed', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				progress: {
					current_step_id: 'theme_selection',
					current_step_index: 3,
					completed_steps: [ 'building_for' ],
				},
				choices: { theme_selection: 'hello-elementor' },
			} );

			// Assert
			expect( screen.queryByText( 'Installed' ) ).not.toBeInTheDocument();
		} );

		it( 'should show Continue button (not "Continue with this theme") when theme is installed', () => {
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
			expect( screen.getByText( 'Continue' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Continue with this theme' ) ).not.toBeInTheDocument();
		} );

		it( 'should show "Continue with this theme" when step is not yet completed', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.getByText( 'Continue with this theme' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Recommended chip', () => {
		it( 'should show Recommended chip on the recommended theme when not installed', () => {
			// Arrange & Act
			navigateToThemeSelection();

			// Assert
			expect( screen.getByText( 'Recommended' ) ).toBeInTheDocument();
		} );

		it( 'should NOT show Recommended chip when theme is installed', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				progress: {
					current_step_id: 'theme_selection',
					current_step_index: 3,
					completed_steps: [ 'theme_selection' ],
				},
				choices: { theme_selection: 'hello-elementor' },
			} );

			// Assert - Installed chip should be present, not Recommended
			expect( screen.getByText( 'Installed' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Recommended' ) ).not.toBeInTheDocument();
		} );
	} );
} );
