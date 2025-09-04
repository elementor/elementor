import React from 'react';
import { render, screen } from '@testing-library/react';
import ImportComplete from 'elementor/app/modules/import-export-customization/assets/js/import/pages/import-complete';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';
import useContextDetection from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection';

const mockUseImportContext = jest.fn();
const mockNavigate = jest.fn();

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection' );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context', () => ( {
	useImportContext: () => mockUseImportContext(),
} ) );

jest.mock( '@reach/router', () => ( {
	useNavigate: () => mockNavigate,
} ) );

const mockSendPageViewsWebsiteTemplates = jest.fn();
const mockSendExportKitCustomization = jest.fn();
jest.mock( 'elementor/app/assets/js/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendPageViewsWebsiteTemplates: ( ...args ) => mockSendPageViewsWebsiteTemplates( ...args ),
		sendExportKitCustomization: ( ...args ) => mockSendExportKitCustomization( ...args ),
	},
} ) );
describe( 'ImportComplete Page', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		useContextDetection.mockImplementation( () => ( {
			isImport: true,
			contextData: { data: { kitUploadParams: { source: 'cloud' } } },
		} ) );
		global.elementorAppConfig = { assets_url: 'http://localhost/assets/' };
		global.elementorCommon = {
			eventsManager: {
				config: eventsConfig,
			},
		};
	} );

	afterEach( () => {
		delete global.elementorAppConfig;
		delete global.elementorCommon;
	} );

	function setup( { isCompleted = true } = {} ) {
		mockUseImportContext.mockReturnValue( {
			isCompleted,
			data: {
				includes: [ 'settings', 'content', 'plugins' ],
			},
			runnersState: {
				plugins: [ 'WooCommerce', 'Advanced Custom Fields' ],
			},
		} );
	}

	it( 'renders the main success message and sections when completed', () => {
		// Arrange
		setup( { isCompleted: true } );
		// Act
		render( <ImportComplete /> );
		// Assert
		expect( screen.getByText( /Your website templates is now live on your site!/i ) ).toBeTruthy();
		expect( screen.getByText( /You've imported and applied the following to your site:/i ) ).toBeTruthy();
		expect( screen.getByText( /What's included:/i ) ).toBeTruthy();
		expect( screen.getByText( /Site settings/i ) ).toBeTruthy();
		expect( screen.getByText( /Content/ ) ).toBeTruthy();
		expect( screen.getByText( /Plugins/ ) ).toBeTruthy();
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
		expect( mockSendExportKitCustomization ).toHaveBeenCalledWith( expect.objectContaining( {
			kit_description: false,
			kit_import_content: true,
			kit_import_plugins: true,
			kit_import_settings: true,
			kit_import_templates: false,
			kit_source: 'file',
		} ) );
	} );
} );
