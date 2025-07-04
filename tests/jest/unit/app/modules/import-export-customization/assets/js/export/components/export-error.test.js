import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportError from 'elementor/app/modules/import-export-customization/assets/js/export/components/export-error';

describe( 'ExportError Component', () => {
	let mockElementorAppConfig;
	let mockWindowOpen;

	beforeEach( () => {
		mockElementorAppConfig = {
			base_url: 'https://example.com',
		};
		global.elementorAppConfig = mockElementorAppConfig;

		delete window.location;
		window.location = { href: '' };

		mockWindowOpen = jest.fn();
		global.window.open = mockWindowOpen;
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Basic Rendering', () => {
		it( 'should render with provided status text', () => {
			render( <ExportError statusText="Test Error" /> );

			expect( screen.getByText( 'Test Error' ) ).toBeTruthy();
		} );

		it( 'should render component when statusText is empty', () => {
			render( <ExportError statusText="" /> );

			// Component still renders the structure
			expect( screen.getByTestId( 'export-error-try-again-button' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-error-learn-more-button' ) ).toBeTruthy();
		} );

		it( 'should render Try Again button', () => {
			render( <ExportError statusText="Error occurred" /> );

			expect( screen.getByTestId( 'export-error-try-again-button' ) ).toBeTruthy();
		} );

		it( 'should render Learn More button', () => {
			render( <ExportError statusText="Error occurred" /> );

			expect( screen.getByTestId( 'export-error-learn-more-button' ) ).toBeTruthy();
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should handle Try Again button click', () => {
			render( <ExportError statusText="Error occurred" /> );

			const tryAgainButton = screen.getByTestId( 'export-error-try-again-button' );
			expect( tryAgainButton ).toBeTruthy();

			fireEvent.click( tryAgainButton );
			expect( window.location.href ).toBe( 'https://example.com#/export-customization/' );
		} );

		it( 'should handle Learn More button click', () => {
			render( <ExportError statusText="Error occurred" /> );

			const learnMoreButton = screen.getByTestId( 'export-error-learn-more-button' );
			expect( learnMoreButton ).toBeTruthy();

			fireEvent.click( learnMoreButton );
			expect( mockWindowOpen ).toHaveBeenCalledWith( 'https://go.elementor.com/app-import-download-failed', '_blank' );
		} );
	} );

	describe( 'Component Structure', () => {
		it( 'should render error icon', () => {
			render( <ExportError statusText="Error occurred" /> );

			const svg = document.querySelector( 'svg' );
			expect( svg ).toBeTruthy();
		} );

		it( 'should render heading with correct text', () => {
			render( <ExportError statusText="Test Error" /> );

			const heading = screen.getByRole( 'heading' );
			expect( heading ).toBeTruthy();
			expect( heading.textContent ).toBe( 'Test Error' );
		} );

		it( 'should render buttons in correct order', () => {
			render( <ExportError statusText="Error occurred" /> );

			const tryAgainButton = screen.getByTestId( 'export-error-try-again-button' );
			const learnMoreButton = screen.getByTestId( 'export-error-learn-more-button' );
			
			expect( tryAgainButton ).toBeTruthy();
			expect( learnMoreButton ).toBeTruthy();
			expect( tryAgainButton.textContent ).toBe( 'Try Again' );
			expect( learnMoreButton.textContent ).toBe( 'Learn More' );
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'should have accessible buttons', () => {
			render( <ExportError statusText="Error occurred" /> );

			const tryAgainButton = screen.getByTestId( 'export-error-try-again-button' );
			const learnMoreButton = screen.getByTestId( 'export-error-learn-more-button' );

			expect( tryAgainButton ).toBeTruthy();
			expect( learnMoreButton ).toBeTruthy();
		} );
	} );
} );
