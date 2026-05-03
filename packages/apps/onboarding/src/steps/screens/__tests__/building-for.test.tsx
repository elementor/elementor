/* eslint-disable testing-library/no-test-id-queries */
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { mockFetch, renderApp, setupOnboardingTests } from '../../../__tests__/test-utils';

describe( 'BuildingFor', () => {
	setupOnboardingTests();

	describe( 'Greeting text', () => {
		it( 'should show greeting without name for guest user', () => {
			// Arrange
			renderApp( { isConnected: false } );

			// Act - continue as guest to reach the building_for step
			fireEvent.click( screen.getByText( 'Continue as a guest' ) );

			// Assert
			expect( screen.getByTestId( 'building-for-step' ) ).toBeInTheDocument();
			expect( screen.getByText( /Hey.*Let's get your site set up\./i ) ).toBeInTheDocument();
		} );

		it( 'should show greeting without name when connected user has no userName', () => {
			// Arrange & Act
			renderApp( { isConnected: true, userName: '' } );

			// Assert
			expect( screen.getByTestId( 'building-for-step' ) ).toBeInTheDocument();
			expect( screen.getByText( /Hey.*Let's get your site set up\./i ) ).toBeInTheDocument();
		} );

		it( 'should show greeting with name when connected user has userName', () => {
			// Arrange & Act
			renderApp( { isConnected: true, userName: 'John' } );

			// Assert
			expect( screen.getByTestId( 'building-for-step' ) ).toBeInTheDocument();
			expect( screen.getByText( /Hey John.*Let's get your site set up\./i ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Option rendering', () => {
		it( 'should render all building_for options', () => {
			// Arrange & Act
			renderApp( { isConnected: true } );

			// Assert
			expect( screen.getByText( 'Myself or someone I know' ) ).toBeInTheDocument();
			expect( screen.getByText( 'My business or workplace' ) ).toBeInTheDocument();
			expect( screen.getByText( 'A client' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Just exploring' ) ).toBeInTheDocument();
		} );

		it( 'should render the step title', () => {
			// Arrange & Act
			renderApp( { isConnected: true } );

			// Assert
			expect( screen.getByText( 'Who are you building for?' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Selection behavior', () => {
		it( 'should call API with correct value when selecting an option', async () => {
			// Arrange
			renderApp( { isConnected: true } );

			// Act
			fireEvent.click( screen.getByText( 'Myself or someone I know' ) );

			// Assert - should call user-choices API with building_for value
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'user-choices' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'myself' ),
					} )
				);
			} );
		} );

		it( 'should navigate to next step after successful selection', async () => {
			// Arrange
			renderApp( { isConnected: true } );

			// Act
			fireEvent.click( screen.getByText( 'A client' ) );

			// Assert - should call user-progress API (complete_step) after choices are saved
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

		it( 'should call API with correct value for different options', async () => {
			// Arrange
			renderApp( { isConnected: true } );

			// Act
			fireEvent.click( screen.getByText( 'Just exploring' ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'user-choices' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'exploring' ),
					} )
				);
			} );
		} );
	} );

	describe( 'Pre-selected state', () => {
		it( 'should show previously selected option from saved choices', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				choices: { building_for: 'business' },
			} );

			// Assert - the business option should be pressed
			const businessButton = screen.getByRole( 'button', { name: 'My business or workplace' } );
			expect( businessButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );
	} );
} );
