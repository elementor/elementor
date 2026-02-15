import { fireEvent, screen, waitFor } from '@testing-library/react';

import { mockFetch, renderApp, setupOnboardingTests } from '../../../__tests__/test-utils';

describe( 'ExperienceLevel', () => {
	setupOnboardingTests();

	it( 'renders title and subtitle', () => {
		// Arrange & Act
		renderApp( {
			isConnected: true,
			progress: { current_step_id: 'experience_level', current_step_index: 2 },
		} );

		// Assert
		expect( screen.getByText( 'How much experience do you have with Elementor?' ) ).toBeInTheDocument();
		expect( screen.getByText( 'This helps us adjust the editor to your workflow.' ) ).toBeInTheDocument();
	} );

	it( 'renders all three options', () => {
		// Arrange & Act
		renderApp( {
			isConnected: true,
			progress: { current_step_id: 'experience_level', current_step_index: 2 },
		} );

		// Assert
		expect( screen.getByText( "I'm just getting started" ) ).toBeInTheDocument();
		expect( screen.getByText( 'I have some experience' ) ).toBeInTheDocument();
		expect( screen.getByText( "I'm very comfortable with Elementor" ) ).toBeInTheDocument();
	} );

	it( 'calls API with correct value when selecting an option', async () => {
		// Arrange
		renderApp( {
			isConnected: true,
			progress: { current_step_id: 'experience_level', current_step_index: 2 },
		} );

		// Act
		fireEvent.click( screen.getByText( "I'm just getting started" ) );

		// Assert
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
		// Arrange
		renderApp( {
			isConnected: true,
			progress: { current_step_id: 'experience_level', current_step_index: 2 },
		} );

		// Act
		fireEvent.click( screen.getByText( "I'm very comfortable with Elementor" ) );

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

	it( 'shows previously selected option from saved choices', () => {
		// Arrange & Act
		renderApp( {
			isConnected: true,
			progress: { current_step_id: 'experience_level', current_step_index: 2 },
			choices: { experience_level: 'intermediate' },
		} );

		// Assert
		const intermediateButton = screen.getByRole( 'button', { name: 'I have some experience' } );
		expect( intermediateButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );
} );
