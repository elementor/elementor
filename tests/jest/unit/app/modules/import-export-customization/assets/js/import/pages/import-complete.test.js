import React from 'react';
import { render, screen } from '@testing-library/react';
import ImportComplete from 'elementor/app/modules/import-export-customization/assets/js/import/pages/import-complete';

const mockUseImportContext = jest.fn();
const mockNavigate = jest.fn();

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context', () => ( {
	useImportContext: () => mockUseImportContext(),
} ) );

jest.mock( '@reach/router', () => ( {
	useNavigate: () => mockNavigate,
} ) );

describe( 'ImportComplete Page', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		global.elementorAppConfig = { assets_url: 'http://localhost/assets/' };
		global.elementorCommon = {};
	} );

	afterEach( () => {
		delete global.elementorAppConfig;
		delete global.elementorCommon;
	} );

	function setup( { isCompleted = true } = {} ) {
		mockUseImportContext.mockReturnValue( { isCompleted } );
	}

	it( 'renders the main success message and sections when completed', () => {
		// Arrange
		setup( { isCompleted: true } );
		// Act
		render( <ImportComplete /> );
		// Assert
		expect( screen.getByText( /Your website templates is now live on your site!/i ) ).toBeTruthy();
		expect( screen.getByText( /You've imported and applied the following to your site:/i ) ).toBeTruthy();
		expect( screen.getByText( /This website templates includes:/i ) ).toBeTruthy();
		expect( screen.getByText( /Site settings/i ) ).toBeTruthy();
		expect( screen.getByText( /Content/i ) ).toBeTruthy();
		expect( screen.getByText( /Plugins/i ) ).toBeTruthy();
		expect( screen.getByText( /Show me how/i ) ).toBeTruthy();
		expect( screen.getByRole( 'img', { name: /Kit is live illustration/i } ) ).toBeTruthy();
	} );

	it( 'renders footer buttons', () => {
		// Arrange
		setup( { isCompleted: true } );
		// Act
		render( <ImportComplete /> );
		// Assert
		const seeItLiveBtn = screen.getByTestId( 'see-it-live-button' );
		const closeBtn = screen.getByTestId( 'close-button' );
		expect( seeItLiveBtn ).toBeTruthy();
		expect( closeBtn ).toBeTruthy();
		expect( seeItLiveBtn.textContent ).toMatch( /See it Live/i );
		expect( closeBtn.textContent ).toMatch( /Close/i );
	} );

	it( 'redirects to /import-customization if not completed', () => {
		// Arrange
		setup( { isCompleted: false } );
		// Act
		render( <ImportComplete /> );
		// Assert
		expect( mockNavigate ).toHaveBeenCalledWith( '/import-customization', { replace: true } );
	} );
} );
