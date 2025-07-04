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
			render( <ExportError statusText="Error occurred" /> );
			
			const tryAgainButton = screen.getByText( 'Try Again' );
			expect( tryAgainButton ).toBeTruthy();			

			fireEvent.click( tryAgainButton );
			expect( window.location.href ).toBe( 'https://example.com#/export-customization/' );
		} );

		it( 'should handle Learn More button click', () => {
			render( <ExportError statusText="Error occurred" /> );
			
			const learnMoreButton = screen.getByText( 'Learn More' );
			expect( learnMoreButton ).toBeTruthy();

			fireEvent.click(learnMoreButton);
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

			const buttons = screen.getAllByRole( 'button' );
			expect( buttons.length ).toBe( 2 );
			expect( buttons[ 0 ].textContent ).toBe( 'Try Again' );
			expect( buttons[ 1 ].textContent ).toBe( 'Learn More' );
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'should have accessible buttons', () => {
			render( <ExportError statusText="Error occurred" /> );

			const tryAgainButton = screen.getByRole( 'button', { name: 'Try Again' } );
			const learnMoreButton = screen.getByRole( 'button', { name: 'Learn More' } );

			expect( tryAgainButton ).toBeTruthy();
			expect( learnMoreButton ).toBeTruthy();
		} );
	} );
} );
