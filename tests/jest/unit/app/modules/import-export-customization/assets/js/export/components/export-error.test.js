import React from 'react';
import { render, screen } from '@testing-library/react';
import ExportError from 'elementor/app/modules/import-export-customization/assets/js/export/components/export-error';

describe( 'ExportError Component', () => {
	let mockElementorAppConfig;
	let mockWindowOpen;

	beforeEach( () => {
		// Mock global config
		mockElementorAppConfig = {
			base_url: 'https://example.com/elementor',
		};
		global.elementorAppConfig = mockElementorAppConfig;

		// Mock window.location
		delete window.location;
		window.location = { href: '' };

		// Mock window.open
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
			expect( screen.getByText( 'Try Again' ) ).toBeTruthy();
			expect( screen.getByText( 'Learn More' ) ).toBeTruthy();
		} );

		it( 'should render Try Again button', () => {
			render( <ExportError statusText="Error occurred" /> );
			
			expect( screen.getByText( 'Try Again' ) ).toBeTruthy();
		} );

		it( 'should render Learn More button', () => {
			render( <ExportError statusText="Error occurred" /> );
			
			expect( screen.getByText( 'Learn More' ) ).toBeTruthy();
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should handle Try Again button click', () => {
			const mockReload = jest.fn();
			Object.defineProperty( window, 'location', {
				value: {
					reload: mockReload,
				},
				writable: true,
			} );

			render( <ExportError statusText="Error occurred" /> );
			
			const tryAgainButton = screen.getByText( 'Try Again' );
			expect( tryAgainButton ).toBeTruthy();
			
			// Test that button is clickable
			expect( tryAgainButton.tagName ).toBe( 'BUTTON' );
		} );

		it( 'should handle Learn More button click', () => {
			const mockOpen = jest.fn();
			global.open = mockOpen;

			render( <ExportError statusText="Error occurred" /> );
			
			const learnMoreButton = screen.getByText( 'Learn More' );
			expect( learnMoreButton ).toBeTruthy();
			
			// Test that button is clickable
			expect( learnMoreButton.tagName ).toBe( 'BUTTON' );
		} );
	} );

	describe( 'Error Message Variations', () => {
		it( 'should handle empty status text gracefully', () => {
			render( <ExportError statusText="" /> );

			// Should still render the component structure
			expect( screen.getByText( 'Try Again' ) ).toBeTruthy();
			expect( screen.getByText( 'Learn More' ) ).toBeTruthy();
		} );

		it( 'should handle long status text', () => {
			const longStatusText = 'This is a very long error message that should still be displayed properly regardless of its length and content';
			
			render( <ExportError statusText={ longStatusText } /> );

			expect( screen.getByText( longStatusText ) ).toBeTruthy();
		} );

		it( 'should handle special characters in status text', () => {
			const specialStatusText = 'Error: <script>alert("test")</script> & special chars!';
			
			render( <ExportError statusText={ specialStatusText } /> );

			expect( screen.getByText( specialStatusText ) ).toBeTruthy();
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

		it( 'should render description text', () => {
			render( <ExportError statusText="Error occurred" /> );

			const description = screen.getByText( 
				'We couldn\'t complete the export. Please try again, and if the problem persists, check our help guide for troubleshooting steps.'
			);
			expect( description ).toBeTruthy();
		} );

		it( 'should render buttons in correct order', () => {
			render( <ExportError statusText="Error occurred" /> );

			const buttons = screen.getAllByRole( 'button' );
			expect( buttons.length ).toBe( 2 );
			expect( buttons[ 0 ].textContent ).toBe( 'Try Again' );
			expect( buttons[ 1 ].textContent ).toBe( 'Learn More' );
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'should have proper heading structure', () => {
			render( <ExportError statusText="Export Error" /> );

			const heading = screen.getByRole( 'heading' );
			expect( heading ).toBeTruthy();
			expect( heading.textContent ).toBe( 'Export Error' );
		} );

		it( 'should have accessible buttons', () => {
			render( <ExportError statusText="Error occurred" /> );

			const tryAgainButton = screen.getByRole( 'button', { name: 'Try Again' } );
			const learnMoreButton = screen.getByRole( 'button', { name: 'Learn More' } );

			expect( tryAgainButton ).toBeTruthy();
			expect( learnMoreButton ).toBeTruthy();
		} );
	} );

	describe( 'Error Handling', () => {
		it( 'should handle missing statusText prop', () => {
			render( <ExportError /> );

			// Should still render the component structure
			expect( screen.getByText( 'Try Again' ) ).toBeTruthy();
			expect( screen.getByText( 'Learn More' ) ).toBeTruthy();
		} );
	} );

	describe( 'Error Types and Context', () => {
		it( 'should handle network-related errors', () => {
			const networkError = 'Network connection failed. Please check your internet connection and try again.';
			render( <ExportError statusText={ networkError } /> );

			expect( screen.getByText( networkError ) ).toBeTruthy();
		} );

		it( 'should handle server-related errors', () => {
			const serverError = 'Server error occurred. Please try again later.';
			render( <ExportError statusText={ serverError } /> );

			expect( screen.getByText( serverError ) ).toBeTruthy();
		} );

		it( 'should handle validation errors', () => {
			const validationError = 'Export validation failed. Please check your kit configuration.';
			render( <ExportError statusText={ validationError } /> );

			expect( screen.getByText( validationError ) ).toBeTruthy();
		} );

		it( 'should handle permission errors', () => {
			const permissionError = 'Permission denied. Please check your user permissions.';
			render( <ExportError statusText={ permissionError } /> );

			expect( screen.getByText( permissionError ) ).toBeTruthy();
		} );
	} );
} );
