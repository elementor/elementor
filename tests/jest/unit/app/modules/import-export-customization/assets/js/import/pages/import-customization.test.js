import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportCustomization from 'elementor/app/modules/import-export-customization/assets/js/import/pages/import-customization';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockUseImportContext = jest.fn();

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context', () => ( {
	...jest.requireActual( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context' ),
	useImportContext: () => mockUseImportContext(),
} ) );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( '@reach/router', () => ( {
	useNavigate: () => mockNavigate,
} ) );

const mockSendPageViewsWebsiteTemplates = jest.fn();
jest.mock( 'elementor/app/assets/js/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendPageViewsWebsiteTemplates: ( ...args ) => mockSendPageViewsWebsiteTemplates( ...args ),
	},
} ) );

import useContextDetection from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection';

describe( 'ImportCustomization Page', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		global.elementorAppConfig = { base_url: 'http://localhost' };
		global.elementorCommon = {
			eventsManager: {
				config: eventsConfig,
			},
		};

		global.elementorModules = {
			importExport: {
				siteSettingsRegistry: {
					getAll: jest.fn( () => [
						{
							key: 'theme',
							title: __( 'Theme', 'elementor' ),
							description: __( 'Only public WordPress themes are supported', 'elementor' ),
							order: 0,
						},
						{
							key: 'siteSettings',
							title: __( 'Site settings', 'elementor' ),
							order: 1,
							children: [
								{
									key: 'globalColors',
									title: __( 'Global colors', 'elementor' ),
									order: 0,
								},
								{
									key: 'globalFonts',
									title: __( 'Global fonts', 'elementor' ),
									order: 1,
								},
								{
									key: 'themeStyleSettings',
									title: __( 'Theme style settingss', 'elementor' ),
									order: 2,
								},
							],
						},
						{
							key: 'generalSettings',
							title: __( 'Settings', 'elementor' ),
							description: __( 'Include site identity, background, layout, Lightbox, page transitions, and custom CSS', 'elementor' ),
							order: 2,
						},
						{
							key: 'experiments',
							title: __( 'Experiments', 'elementor' ),
							description: __( 'This will apply all experiments that are still active during import', 'elementor' ),
							order: 3,
						},
					] ),
					getState: jest.fn( ( data, parentInitialState ) => {
						function getSectionState( section ) {
							const state = {};

							const isImport = data?.hasOwnProperty( 'uploadedData' );

							if ( isImport ) {
								state[ section.key ] = data?.uploadedData?.manifest?.[ 'site-settings' ]?.[ section.key ];
								return state;
							}

							if ( data?.customization?.settings?.[ section.key ] !== undefined ) {
								state[ section.key ] = data.customization.settings[ section.key ];
								return state;
							}

							if ( section.getInitialState ) {
								state[ section.key ] = section.getInitialState( data, parentInitialState );
								return state;
							}

							state[ section.key ] = section.useParentDefault ? parentInitialState : false;

							return state;
						}
						const state = {};
						const sections = global.elementorModules.importExport.siteSettingsRegistry.getAll();

						sections.forEach( ( section ) => {
							if ( section.children ) {
								section.children?.forEach( ( childSection ) => {
									const sectionState = getSectionState( childSection, data, parentInitialState );

									Object.assign( state, sectionState );
								} );
							} else {
								Object.assign( state, getSectionState( section, data, parentInitialState ) );
							}
						} );

						return state;
					} ),

				},
			},
		};
	} );

	afterEach( () => {
		delete global.elementorAppConfig;
		delete global.elementorCommon;
	} );

	function setup( { isCustomizing = true, isProcessing = false } = {} ) {
		const contextData = {
			isCustomizing,
			isProcessing,
			dispatch: mockDispatch,
			data: { includes: [], customization: {} },
		};

		mockUseImportContext.mockReturnValue( contextData );

		useContextDetection.mockReturnValue( {
			isImport: true,
			contextData,
		} );
	}

	it( 'renders main content and ImportKitContent', async () => {
		// Arrange
		setup();
		// Act
		render( <ImportCustomization /> );
		// Assert
		expect( screen.getByText( 'Select which parts you want to apply' ) ).toBeTruthy();
		expect( screen.getByText( /These are the templates/ ) ).toBeTruthy();
		expect( screen.getByTestId( 'import-kit-parts-content' ) ).toBeTruthy();

		await waitFor( () => expect( mockSendPageViewsWebsiteTemplates ).toHaveBeenCalledWith( 'kit_import_customization' ) );
	} );

	it( 'dispatches SET_IMPORT_STATUS PENDING when Back is clicked', () => {
		// Arrange
		setup();
		render( <ImportCustomization /> );
		const backButton = screen.getByTestId( 'import-back-button' );
		// Act
		fireEvent.click( backButton );
		// Assert
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_IMPORT_STATUS', payload: 'PENDING' } );
	} );

	it( 'dispatches SET_IMPORT_STATUS IMPORTING and navigates when Import and apply is clicked', () => {
		// Arrange
		setup();
		render( <ImportCustomization /> );
		const importButton = screen.getByTestId( 'import-apply-button' );
		// Act
		fireEvent.click( importButton );
		// Assert
		expect( importButton.textContent ).toBe( 'Import and apply' );
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_IMPORT_STATUS', payload: 'IMPORTING' } );
		expect( mockNavigate ).toHaveBeenCalledWith( 'import/process' );
	} );

	it( 'navigates to process if isProcessing is true', () => {
		// Arrange
		setup( { isProcessing: true } );
		// Act
		render( <ImportCustomization /> );
		// Assert
		expect( mockNavigate ).toHaveBeenCalledWith( 'import/process' );
	} );

	it( 'navigates to import if isCustomizing is false', () => {
		// Arrange
		setup( { isCustomizing: false } );
		// Act
		render( <ImportCustomization /> );
		// Assert
		expect( mockNavigate ).toHaveBeenCalledWith( 'import', { replace: true } );
	} );
} );
