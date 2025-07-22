import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KitPluginsCustomizationDialog } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/kit-plugins-customization-dialog';

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-kit-plugins' );
import useKitPlugins from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-kit-plugins';

global.__ = jest.fn( ( text ) => text );

describe( 'KitPluginsCustomizationDialog Component', () => {
	const mockHandleClose = jest.fn();
	const mockHandleSaveChanges = jest.fn();

	const mockPluginsList = {
		'elementor/elementor.php': {
			name: 'Elementor',
			plugin: 'elementor/elementor.php',
			version: '3.18.0',
			pluginUri: 'https://elementor.com',
		},
		'advanced-custom-fields/acf.php': {
			name: 'Advanced Custom Fields',
			plugin: 'advanced-custom-fields/acf.php',
			version: '6.2.4',
			pluginUri: 'https://www.advancedcustomfields.com/',
		},
		'contact-form-7/wp-contact-form-7.php': {
			name: 'Contact Form 7',
			plugin: 'contact-form-7/wp-contact-form-7.php',
			version: '5.8.2',
			pluginUri: '',
		},
	};

	const mockData = {
		includes: [ 'plugins' ],
		customization: {
			plugins: null,
		},
	};

	beforeEach( () => {
		jest.clearAllMocks();
		useKitPlugins.mockReturnValue( {
			pluginsList: mockPluginsList,
			isLoading: false,
		} );
	} );

	describe( 'Dialog Rendering', () => {
		it( 'should render dialog when open is true', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.getByText( 'Edit plugins' ) ).toBeTruthy();
			expect( screen.getByText( 'Save changes' ) ).toBeTruthy();
			expect( screen.getByText( 'Cancel' ) ).toBeTruthy();
		} );

		it( 'should not render dialog content when open is false', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ false }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.queryByText( 'Edit plugins' ) ).toBeFalsy();
		} );

		it( 'should render plugin section title', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.getByText( 'Plugin name and version' ) ).toBeTruthy();
		} );
	} );

	describe( 'Loading State', () => {
		it( 'should show loading spinner when isLoading is true', () => {
			useKitPlugins.mockReturnValue( {
				pluginsList: {},
				isLoading: true,
			} );

			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.getByRole( 'progressbar' ) ).toBeTruthy();
		} );

		it( 'should hide loading spinner when isLoading is false', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.queryByRole( 'progressbar' ) ).toBeFalsy();
		} );

		it( 'should disable save button when loading', () => {
			useKitPlugins.mockReturnValue( {
				pluginsList: {},
				isLoading: true,
			} );

			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const saveButton = screen.getByText( 'Save changes' );
			expect( saveButton.disabled ).toBe( true );
		} );
	} );

	describe( 'Plugin List Rendering', () => {
		it( 'should render all plugins from the list', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.getByText( 'Elementor' ) ).toBeTruthy();
			expect( screen.getByText( 'Advanced Custom Fields' ) ).toBeTruthy();
			expect( screen.getByText( 'Contact Form 7' ) ).toBeTruthy();
		} );

		it( 'should not render links for plugins without pluginUri', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const cf7VersionText = screen.getByText( /Version 5\.8\.2/ );
			expect( cf7VersionText.closest( 'a' ) ).toBeFalsy();
		} );
	} );

	describe( 'Initial State', () => {
		it( 'should initialize plugins as checked when plugins is in includes', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const checkboxes = screen.getAllByRole( 'checkbox' );

			checkboxes.forEach( ( checkbox ) => {
				expect( checkbox.checked ).toBe( true );
			} );
		} );

		it( 'should use existing customization settings when available', () => {
			const dataWithCustomization = {
				includes: [ 'plugins' ],
				customization: {
					plugins: {
						'elementor/elementor.php': true,
						'advanced-custom-fields/acf.php': false,
						'contact-form-7/wp-contact-form-7.php': true,
					},
				},
			};

			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithCustomization }
				/>,
			);

			const elementorCheckbox = screen.getByLabelText( 'Elementor' );
			const acfCheckbox = screen.getByLabelText( 'Advanced Custom Fields' );
			const cf7Checkbox = screen.getByLabelText( 'Contact Form 7' );

			expect( elementorCheckbox.checked ).toBe( true );
			expect( acfCheckbox.checked ).toBe( false );
			expect( cf7Checkbox.checked ).toBe( true );
		} );
	} );

	describe( 'Required Plugins Behavior', () => {
		it( 'should disable Elementor checkbox as it is required', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const elementorCheckbox = screen.getByLabelText( 'Elementor' );
			expect( elementorCheckbox.disabled ).toBe( true );
			expect( elementorCheckbox.checked ).toBe( true );
		} );

		it( 'should always keep required plugins checked', () => {
			const dataWithoutPlugins = {
				includes: [],
				customization: {
					plugins: null,
				},
			};

			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithoutPlugins }
				/>,
			);

			const elementorCheckbox = screen.getByLabelText( 'Elementor' );
			expect( elementorCheckbox.checked ).toBe( true );
		} );
	} );

	describe( 'Select All Functionality', () => {
		it( 'should render "All plugins" checkbox', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const allPluginsCheckbox = screen.getByLabelText( 'All plugins' );
			expect( allPluginsCheckbox ).toBeTruthy();
		} );

		it( 'should check "All plugins" when all non-required plugins are selected', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const allPluginsCheckbox = screen.getByLabelText( 'All plugins' );
			expect( allPluginsCheckbox.checked ).toBe( true );
		} );

		it( 'should show mixed state when some non-required plugins are selected', () => {
			const dataWithPartialSelection = {
				includes: [ 'plugins' ],
				customization: {
					plugins: {
						'elementor/elementor.php': true,
						'advanced-custom-fields/acf.php': false,
						'contact-form-7/wp-contact-form-7.php': true,
					},
				},
			};

			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithPartialSelection }
				/>,
			);

			const allPluginsCheckbox = screen.getByLabelText( 'All plugins' );
			const acfCheckbox = screen.getByLabelText( 'Advanced Custom Fields' );
			const cf7Checkbox = screen.getByLabelText( 'Contact Form 7' );

			expect( acfCheckbox.checked ).toBe( false );
			expect( cf7Checkbox.checked ).toBe( true );

			expect( allPluginsCheckbox.checked ).toBe( false );
		} );

		it( 'should handle "All plugins" checkbox interactions', () => {
			const dataWithoutPlugins = {
				includes: [],
				customization: {
					plugins: null,
				},
			};

			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithoutPlugins }
				/>,
			);

			const allPluginsCheckbox = screen.getByLabelText( 'All plugins' );
			const acfCheckbox = screen.getByLabelText( 'Advanced Custom Fields' );
			const cf7Checkbox = screen.getByLabelText( 'Contact Form 7' );
			const elementorCheckbox = screen.getByLabelText( 'Elementor' );

			expect( allPluginsCheckbox.checked ).toBe( false );
			expect( acfCheckbox.checked ).toBe( false );
			expect( cf7Checkbox.checked ).toBe( false );
			expect( elementorCheckbox.checked ).toBe( true );

			expect( allPluginsCheckbox ).toBeTruthy();
			expect( allPluginsCheckbox.disabled ).toBe( false );
		} );
	} );

	describe( 'Individual Plugin Toggle', () => {
		it( 'should toggle individual non-required plugin when clicked', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const acfCheckbox = screen.getByLabelText( 'Advanced Custom Fields' );
			expect( acfCheckbox.checked ).toBe( true );

			fireEvent.click( acfCheckbox );
			expect( acfCheckbox.checked ).toBe( false );

			fireEvent.click( acfCheckbox );
			expect( acfCheckbox.checked ).toBe( true );
		} );

		it( 'should not allow toggling required plugins', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const elementorCheckbox = screen.getByLabelText( 'Elementor' );
			const initialState = elementorCheckbox.checked;

			fireEvent.click( elementorCheckbox );

			expect( elementorCheckbox.checked ).toBe( initialState );
		} );
	} );

	describe( 'Dialog Actions', () => {
		it( 'should call handleClose when Cancel button is clicked', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const cancelButton = screen.getByText( 'Cancel' );
			fireEvent.click( cancelButton );

			expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call handleSaveChanges and handleClose when Save changes is clicked', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'plugins',
				{
					'elementor/elementor.php': true,
					'advanced-custom-fields/acf.php': true,
					'contact-form-7/wp-contact-form-7.php': true,
				},
			);
			expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should save current plugin selection state', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const acfCheckbox = screen.getByLabelText( 'Advanced Custom Fields' );
			fireEvent.click( acfCheckbox );

			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'plugins',
				{
					'elementor/elementor.php': true,
					'advanced-custom-fields/acf.php': false,
					'contact-form-7/wp-contact-form-7.php': true,
				},
			);
		} );
	} );

	describe( 'Hook Integration', () => {
		it( 'should call useKitPlugins with open prop', () => {
			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( useKitPlugins ).toHaveBeenCalledWith( { open: true } );
		} );

		it( 'should handle empty plugins list', () => {
			useKitPlugins.mockReturnValue( {
				pluginsList: {},
				isLoading: false,
			} );

			render(
				<KitPluginsCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.getByText( 'All plugins' ) ).toBeTruthy();
			expect( screen.queryByText( 'Elementor' ) ).toBeFalsy();
		} );
	} );
} );
