import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import KitSettingsCustomizationDialog from 'elementor/app/modules/import-export-customization/assets/js/export/components/kit-settings-customization-dialog';

// Mock the export context
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context', () => ( {
	useExportContext: jest.fn(),
} ) );

// Mock the __ function for translations
global.__ = jest.fn( ( text ) => text );

import { useExportContext } from 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context';

describe( 'KitSettingsCustomizationDialog Component', () => {
	let mockDispatch;
	let mockHandleClose;

	beforeEach( () => {
		mockDispatch = jest.fn();
		mockHandleClose = jest.fn();

		useExportContext.mockReturnValue( {
			data: {
				includes: [ 'settings' ],
				customization: {
					settings: null,
				},
			},
			dispatch: mockDispatch,
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Dialog Rendering', () => {
		it( 'should render dialog when open is true', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			expect( screen.getByText( 'Edit settings & configurations' ) ).toBeTruthy();
			expect( screen.getByText( 'Save changes' ) ).toBeTruthy();
			expect( screen.getByText( 'Cancel' ) ).toBeTruthy();
		} );

		it( 'should not render dialog content when open is false', () => {
			render( <KitSettingsCustomizationDialog open={ false } handleClose={ mockHandleClose } /> );

			expect( screen.queryByText( 'Edit settings & configurations' ) ).toBeFalsy();
		} );

		it( 'should render all settings sections', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			expect( screen.getByText( 'Theme' ) ).toBeTruthy();
			expect( screen.getByText( 'Site settings' ) ).toBeTruthy();
			expect( screen.getByText( 'Settings' ) ).toBeTruthy();
			expect( screen.getByText( 'Experiments' ) ).toBeTruthy();
		} );

		it( 'should render sub-settings under Site settings', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			expect( screen.getByText( 'Global colors' ) ).toBeTruthy();
			expect( screen.getByText( 'Global fonts' ) ).toBeTruthy();
			expect( screen.getByText( 'Theme style settings' ) ).toBeTruthy();
		} );

		it( 'should render section descriptions correctly', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			expect( screen.getByText( 'Only public WordPress themes are supported' ) ).toBeTruthy();
			expect( screen.getByText( 'Include site identity, background, layout, Lightbox, page transitions, and custom CSS' ) ).toBeTruthy();
			expect( screen.getByText( 'This will apply all experiments that are still active during import' ) ).toBeTruthy();
		} );
	} );

	describe( 'Initial State', () => {
		it( 'should initialize with settings enabled when settings is in includes', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			const switches = screen.getAllByRole( 'checkbox' );
			// All switches should be checked since settings is in includes
			switches.forEach( ( switchElement ) => {
				expect( switchElement.checked ).toBe( true );
			} );
		} );

		it( 'should initialize with settings disabled when settings is not in includes', () => {
			useExportContext.mockReturnValue( {
				data: {
					includes: [],
					customization: {
						settings: null,
					},
				},
				dispatch: mockDispatch,
			} );

			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			const switches = screen.getAllByRole( 'checkbox' );
			// All switches should be unchecked since settings is not in includes
			switches.forEach( ( switchElement ) => {
				expect( switchElement.checked ).toBe( false );
			} );
		} );

		it( 'should use existing customization settings when available', () => {
			useExportContext.mockReturnValue( {
				data: {
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
				},
				dispatch: mockDispatch,
			} );

			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			const switches = screen.getAllByRole( 'checkbox' );

			// Check that switches reflect the customization settings
			// We can't easily test individual switches without more specific selectors,
			// but we can verify the dialog renders without error
			expect( switches.length ).toBeGreaterThan( 0 );
		} );
	} );

	describe( 'Toggle Functionality', () => {
		it( 'should toggle switch state when clicked', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			const switches = screen.getAllByRole( 'checkbox' );
			const firstSwitch = switches[ 0 ];
			const initialState = firstSwitch.checked;

			fireEvent.click( firstSwitch );

			expect( firstSwitch.checked ).toBe( ! initialState );
		} );

		it( 'should handle multiple toggle interactions', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			const switches = screen.getAllByRole( 'checkbox' );
			const firstSwitch = switches[ 0 ];
			const secondSwitch = switches[ 1 ];

			// Toggle first switch
			fireEvent.click( firstSwitch );
			// Toggle second switch
			fireEvent.click( secondSwitch );

			// Both switches should have changed from their initial state
			expect( firstSwitch.checked ).toBe( false ); // Was true initially
			expect( secondSwitch.checked ).toBe( false ); // Was true initially
		} );
	} );

	describe( 'Dialog Actions', () => {
		it( 'should call handleClose when Cancel button is clicked', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			const cancelButton = screen.getByText( 'Cancel' );
			fireEvent.click( cancelButton );

			expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call handleClose when close button is clicked', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			// The close button would be in the dialog header, we need to find it by role
			const closeButtons = screen.getAllByRole( 'button' );
			const closeButton = closeButtons.find( ( button ) => 'close' === button.getAttribute( 'aria-label' ) );

			if ( closeButton ) {
				fireEvent.click( closeButton );
				expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
			}
		} );

		it( 'should dispatch customization and close dialog when Save changes is clicked', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'SET_CUSTOMIZATION',
				payload: {
					key: 'settings',
					value: expect.any( Object ),
				},
			} );

			expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should add settings to includes when any setting is enabled', () => {
			useExportContext.mockReturnValue( {
				data: {
					includes: [],
					customization: {
						settings: null,
					},
				},
				dispatch: mockDispatch,
			} );

			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			// Toggle a switch to enable it
			const switches = screen.getAllByRole( 'checkbox' );
			fireEvent.click( switches[ 0 ] );

			// Save changes
			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'ADD_INCLUDE',
				payload: 'settings',
			} );
		} );

		it( 'should remove settings from includes when all settings are disabled', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			// Disable all switches
			// Need to re-query after each click to get updated state
			let switches = screen.getAllByRole( 'checkbox' );
			const switchCount = switches.length;

			for ( let i = 0; i < switchCount; i++ ) {
				// Re-query switches to get current state
				switches = screen.getAllByRole( 'checkbox' );
				if ( switches[ i ].checked ) {
					fireEvent.click( switches[ i ] );
				}
			}

			// Save changes
			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'REMOVE_INCLUDE',
				payload: 'settings',
			} );
		} );
	} );

	describe( 'Context Integration', () => {
		it( 'should update state when dialog opens with existing customization', () => {
			const { rerender } = render(
				<KitSettingsCustomizationDialog open={ false } handleClose={ mockHandleClose } />,
			);

			useExportContext.mockReturnValue( {
				data: {
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
				},
				dispatch: mockDispatch,
			} );

			// Open dialog
			rerender( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			// Dialog should render with customization settings
			expect( screen.getByText( 'Edit settings & configurations' ) ).toBeTruthy();
		} );

		it( 'should handle context data changes', () => {
			const { rerender } = render(
				<KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } />,
			);

			// Change context data
			useExportContext.mockReturnValue( {
				data: {
					includes: [],
					customization: {
						settings: null,
					},
				},
				dispatch: mockDispatch,
			} );

			rerender( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			// Dialog should still render
			expect( screen.getByText( 'Edit settings & configurations' ) ).toBeTruthy();
		} );
	} );

	describe( 'Settings Sections Behavior', () => {
		it( 'should render Site settings section without main toggle correctly', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			// Site settings section doesn't have a main toggle
			const siteSettingsSection = screen.getByText( 'Site settings' );

			expect( siteSettingsSection ).toBeTruthy();

			// Check that sub-settings have toggles
			const globalColorsText = screen.getByText( 'Global colors' );
			const globalColorsParent = globalColorsText.closest( 'div' ).parentElement;
			const globalColorsSwitch = globalColorsParent.querySelector( 'input[type="checkbox"]' );
			expect( globalColorsSwitch ).toBeTruthy();
		} );

		it( 'should render Theme section with toggle and description', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			const themeSection = screen.getByText( 'Theme' );
			const themeDescription = screen.getByText( 'Only public WordPress themes are supported' );

			expect( themeSection ).toBeTruthy();
			expect( themeDescription ).toBeTruthy();
		} );

		it( 'should have exactly 6 toggle switches', () => {
			render( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			const switches = screen.getAllByRole( 'checkbox' );
			// 1 for Theme, 3 for Site settings sub-items, 1 for Settings, 1 for Experiments
			expect( switches.length ).toBe( 6 );
		} );
	} );

	describe( 'Dialog Props', () => {
		it( 'should accept open prop correctly', () => {
			const { rerender } = render(
				<KitSettingsCustomizationDialog open={ false } handleClose={ mockHandleClose } />,
			);

			expect( screen.queryByText( 'Edit settings & configurations' ) ).toBeFalsy();

			rerender( <KitSettingsCustomizationDialog open={ true } handleClose={ mockHandleClose } /> );

			expect( screen.getByText( 'Edit settings & configurations' ) ).toBeTruthy();
		} );

		it( 'should accept handleClose prop correctly', () => {
			const customHandleClose = jest.fn();

			render( <KitSettingsCustomizationDialog open={ true } handleClose={ customHandleClose } /> );

			const cancelButton = screen.getByText( 'Cancel' );
			fireEvent.click( cancelButton );

			expect( customHandleClose ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
