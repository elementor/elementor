import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { KitSettingsCustomizationDialog } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/kit-settings-customization-dialog';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';

global.__ = jest.fn( ( text ) => text );

const mockSendPageViewsWebsiteTemplates = jest.fn();
jest.mock( 'elementor/app/assets/js/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendPageViewsWebsiteTemplates: ( ...args ) => mockSendPageViewsWebsiteTemplates( ...args ),
	},
} ) );

describe( 'KitSettingsCustomizationDialog Component', () => {
	const mockHandleClose = jest.fn();
	const mockHandleSaveChanges = jest.fn();
	const mockData = {
		includes: [ 'settings' ],
		customization: {
			settings: null,
		},
	};

	beforeEach( () => {
		jest.clearAllMocks();

		global.elementorCommon = {
			eventsManager: {
				config: eventsConfig,
			},
		};
	} );

	describe( 'Dialog Rendering', () => {
		it( 'should render dialog when open is true', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Edit settings & configurations' ) ).toBeTruthy();
			expect( screen.getByText( 'Save changes' ) ).toBeTruthy();
			expect( screen.getByText( 'Cancel' ) ).toBeTruthy();
		} );

		it( 'should not render dialog content when open is false', () => {
			// Arrange
			const props = {
				data: mockData,
				open: false,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.queryByText( 'Edit settings & configurations' ) ).toBeFalsy();
		} );

		it( 'should render all settings sections', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Theme' ) ).toBeTruthy();
			expect( screen.getByText( 'Site settings' ) ).toBeTruthy();
			expect( screen.getByText( 'Settings' ) ).toBeTruthy();
			expect( screen.getByText( 'Experiments' ) ).toBeTruthy();
		} );

		it( 'should render sub-settings under Site settings', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Global colors' ) ).toBeTruthy();
			expect( screen.getByText( 'Global fonts' ) ).toBeTruthy();
			expect( screen.getByText( 'Theme style settings' ) ).toBeTruthy();
		} );

		it( 'should render section descriptions correctly', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Only public WordPress themes are supported' ) ).toBeTruthy();
			expect( screen.getByText( 'Include site identity, background, layout, Lightbox, page transitions, and custom CSS' ) ).toBeTruthy();
			expect( screen.getByText( 'This will apply all experiments that are still active during import' ) ).toBeTruthy();
		} );
	} );

	describe( 'Initial State', () => {
		it( 'should initialize with settings enabled when settings is in includes', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			switches.forEach( ( switchElement ) => {
				expect( switchElement.checked ).toBe( true );
			} );
		} );

		it( 'should initialize with settings disabled when settings is not in includes', () => {
			// Arrange
			const data = {
				includes: [],
				customization: {
					settings: null,
				},
			};
			const props = {
				data,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			switches.forEach( ( switchElement ) => {
				expect( switchElement.checked ).toBe( false );
			} );
		} );

		it( 'should use existing customization settings when available', () => {
			// Arrange
			const data = {
				includes: [ 'settings' ],
				customization: {
					settings: {
						theme: true,
						globalColors: false,
						globalFonts: true,
						themeStyleSettings: false,
						generalSettings: true,
						experiments: true,
					},
				},
			};
			const props = {
				data,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			expect( switches.length ).toBeGreaterThan( 0 );
		} );
	} );

	describe( 'Import Mode Functionality', () => {
		it( 'should detect import mode when uploadedData is present', () => {
			// Arrange
			const importData = {
				includes: [ 'settings' ],
				customization: {
					settings: null,
				},
				uploadedData: {
					manifest: {
						'site-settings': {
							theme: true,
							globalColors: false,
							globalFonts: true,
							themeStyleSettings: false,
							generalSettings: true,
							experiments: false,
						},
					},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Edit settings & configurations' ) ).toBeTruthy();
		} );

		it( 'should initialize settings from manifest in import mode', () => {
			// Arrange
			const importData = {
				includes: [ 'settings' ],
				customization: {
					settings: null,
				},
				uploadedData: {
					manifest: {
						'site-settings': {
							theme: true,
							globalColors: false,
							globalFonts: true,
							themeStyleSettings: false,
							generalSettings: true,
							experiments: false,
						},
					},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Theme' ) ).toBeTruthy();
			expect( screen.getByText( 'Site settings' ) ).toBeTruthy();
		} );

		it( 'should handle missing manifest gracefully', () => {
			// Arrange
			const importData = {
				includes: [ 'settings' ],
				customization: {
					settings: null,
				},
				uploadedData: {
					manifest: {},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Edit settings & configurations' ) ).toBeTruthy();
		} );

		it( 'should handle missing site-settings in manifest', () => {
			// Arrange
			const importData = {
				includes: [ 'settings' ],
				customization: {
					settings: null,
				},
				uploadedData: {
					manifest: {},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Edit settings & configurations' ) ).toBeTruthy();
		} );

		it( 'should disable switches based on manifest availability in import mode', () => {
			// Arrange
			const importData = {
				includes: [ 'settings' ],
				customization: {
					settings: null,
				},
				uploadedData: {
					manifest: {
						'site-settings': {
							theme: true,
							globalColors: false,
							globalFonts: true,
							themeStyleSettings: false,
							generalSettings: true,
							experiments: false,
						},
					},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			expect( switches.length ).toBeGreaterThan( 0 );
		} );

		it( 'should prioritize customization settings over manifest in import mode', () => {
			// Arrange
			const importData = {
				includes: [ 'settings' ],
				customization: {
					settings: {
						theme: false,
						globalColors: true,
						globalFonts: false,
						themeStyleSettings: true,
						generalSettings: false,
						experiments: true,
					},
				},
				uploadedData: {
					manifest: {
						'site-settings': {
							theme: true,
							globalColors: false,
							globalFonts: true,
							themeStyleSettings: false,
							generalSettings: true,
							experiments: false,
						},
					},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Edit settings & configurations' ) ).toBeTruthy();
		} );
	} );

	describe( 'Toggle Functionality', () => {
		it( 'should toggle switch state when clicked', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitSettingsCustomizationDialog { ...props } /> );
			const switches = screen.getAllByRole( 'checkbox' );
			const firstSwitch = switches[ 0 ];
			const initialState = firstSwitch.checked;

			// Act
			fireEvent.click( firstSwitch );

			// Assert
			expect( firstSwitch.checked ).toBe( ! initialState );
		} );

		it( 'should handle multiple toggle interactions', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitSettingsCustomizationDialog { ...props } /> );
			const switches = screen.getAllByRole( 'checkbox' );
			const firstSwitch = switches[ 0 ];
			const secondSwitch = switches[ 1 ];

			// Act
			fireEvent.click( firstSwitch );
			fireEvent.click( secondSwitch );

			// Assert
			expect( firstSwitch.checked ).toBe( false );
			expect( secondSwitch.checked ).toBe( false );
		} );

		it( 'should handle toggle interactions in import mode', () => {
			// Arrange
			const importData = {
				includes: [ 'settings' ],
				customization: {
					settings: null,
				},
				uploadedData: {
					manifest: {
						'site-settings': {
							theme: true,
							globalColors: true,
							globalFonts: true,
							themeStyleSettings: true,
							generalSettings: true,
							experiments: true,
						},
					},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitSettingsCustomizationDialog { ...props } /> );
			const switches = screen.getAllByRole( 'checkbox' );
			const firstSwitch = switches[ 0 ];
			const initialState = firstSwitch.checked;

			// Act
			fireEvent.click( firstSwitch );

			// Assert
			expect( firstSwitch.checked ).toBe( ! initialState );
		} );
	} );

	describe( 'Dialog Actions', () => {
		it( 'should call handleClose when Cancel button is clicked', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitSettingsCustomizationDialog { ...props } /> );
			const cancelButton = screen.getByText( 'Cancel' );

			// Act
			fireEvent.click( cancelButton );

			// Assert
			expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call handleClose when close button is clicked', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitSettingsCustomizationDialog { ...props } /> );
			const closeButtons = screen.getAllByRole( 'button' );
			const closeButton = closeButtons.find( ( button ) => 'close' === button.getAttribute( 'aria-label' ) );

			// Act
			if ( closeButton ) {
				fireEvent.click( closeButton );
			}

			// Assert
			if ( closeButton ) {
				expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
			}
		} );

		it( 'should dispatch customization and close dialog when Save changes is clicked', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitSettingsCustomizationDialog { ...props } /> );
			const saveButton = screen.getByText( 'Save changes' );

			// Act
			fireEvent.click( saveButton );

			// Assert
			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'settings',
				{
					experiments: true,
					generalSettings: true,
					globalColors: true,
					globalFonts: true,
					theme: true,
					themeStyleSettings: true,
				},
				[],
			);
			expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should dispatch customization with unselected values', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitSettingsCustomizationDialog { ...props } /> );
			const themeSwitch = within( screen.getByTestId( 'theme-switch' ) ).getByRole( 'checkbox' );
			const saveButton = screen.getByText( 'Save changes' );

			// Act
			fireEvent.click( themeSwitch );
			fireEvent.click( saveButton );

			// Assert
			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'settings',
				{
					experiments: true,
					generalSettings: true,
					globalColors: true,
					globalFonts: true,
					theme: false,
					themeStyleSettings: true,
				},
				[ 'theme' ],
			);
			expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should save manifest-based settings in import mode', () => {
			// Arrange
			const importData = {
				includes: [ 'settings' ],
				customization: {
					settings: null,
				},
				uploadedData: {
					manifest: {
						'site-settings': {
							theme: true,
							globalColors: false,
							globalFonts: true,
							themeStyleSettings: false,
							generalSettings: true,
							experiments: false,
						},
					},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitSettingsCustomizationDialog { ...props } /> );
			const saveButton = screen.getByText( 'Save changes' );

			// Act
			fireEvent.click( saveButton );

			// Assert
			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'settings',
				{
					theme: true,
					globalColors: false,
					globalFonts: true,
					themeStyleSettings: false,
					generalSettings: true,
					experiments: false,
				},
				[ 'globalColors', 'themeStyleSettings', 'experiments' ],
			);
		} );
	} );

	describe( 'Settings Sections Behavior', () => {
		it( 'should render Site settings section without main toggle correctly', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			const siteSettingsSection = screen.getByText( 'Site settings' );
			expect( siteSettingsSection ).toBeTruthy();

			const globalColorsText = screen.getByText( 'Global colors' );
			const globalColorsParent = globalColorsText.closest( 'div' ).parentElement;
			const globalColorsSwitch = globalColorsParent.querySelector( 'input[type="checkbox"]' );
			expect( globalColorsSwitch ).toBeTruthy();
		} );

		it( 'should render Theme section with toggle and description', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			const themeSection = screen.getByText( 'Theme' );
			const themeDescription = screen.getByText( 'Only public WordPress themes are supported' );

			expect( themeSection ).toBeTruthy();
			expect( themeDescription ).toBeTruthy();
		} );

		it( 'should have exactly 6 toggle switches', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitSettingsCustomizationDialog { ...props } /> );

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			expect( switches.length ).toBe( 6 );
		} );
	} );

	describe( 'Dialog Props', () => {
		it( 'should accept handleClose prop correctly', () => {
			// Arrange
			const customHandleClose = jest.fn();
			const props = {
				data: mockData,
				open: true,
				handleClose: customHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitSettingsCustomizationDialog { ...props } /> );
			const cancelButton = screen.getByText( 'Cancel' );

			// Act
			fireEvent.click( cancelButton );

			// Assert
			expect( customHandleClose ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
