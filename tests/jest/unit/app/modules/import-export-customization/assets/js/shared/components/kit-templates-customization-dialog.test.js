import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KitTemplatesCustomizationDialog } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/kit-templates-customization-dialog';

// Mock the __ function for translations
global.__ = jest.fn( ( text ) => text );

describe( 'KitTemplatesCustomizationDialog Component', () => {
	const mockHandleClose = jest.fn();
	const mockHandleSaveChanges = jest.fn();

	const mockData = {
		includes: [ 'templates' ],
		customization: {
			templates: null,
		},
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Dialog Rendering', () => {
		it( 'should render dialog when open is true', () => {
			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.getByText( 'Edit templates' ) ).toBeTruthy();
			expect( screen.getByText( 'Save changes' ) ).toBeTruthy();
			expect( screen.getByText( 'Cancel' ) ).toBeTruthy();
		} );

		it( 'should not render dialog content when open is false', () => {
			render(
				<KitTemplatesCustomizationDialog
					open={ false }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.queryByText( 'Edit templates' ) ).toBeFalsy();
		} );

		it( 'should render site templates section', () => {
			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.getByText( 'Site templates' ) ).toBeTruthy();
		} );

		it( 'should render site templates switch', () => {
			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch ).toBeTruthy();
		} );
	} );

	describe( 'Initial State', () => {
		it( 'should initialize with templates enabled when templates is in includes', () => {
			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( true );
		} );

		it( 'should initialize with templates disabled when templates is not in includes', () => {
			const dataWithoutTemplates = {
				includes: [],
				customization: {
					templates: null,
				},
			};

			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithoutTemplates }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( false );
		} );

		it( 'should use existing customization settings when available', () => {
			const dataWithCustomization = {
				includes: [ 'templates' ],
				customization: {
					templates: {
						siteTemplates: false,
					},
				},
			};

			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithCustomization }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( false );
		} );

		it( 'should override customization settings with true when available and templates included', () => {
			const dataWithEnabledCustomization = {
				includes: [ 'templates' ],
				customization: {
					templates: {
						siteTemplates: true,
					},
				},
			};

			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithEnabledCustomization }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( true );
		} );
	} );

	describe( 'State Reset on Dialog Open', () => {
		it( 'should reset to initial state when dialog opens without customization', () => {
			const { rerender } = render(
				<KitTemplatesCustomizationDialog
					open={ false }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			rerender(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( true );
		} );

		it( 'should reset to customization settings when dialog opens with existing customization', () => {
			const dataWithCustomization = {
				includes: [ 'templates' ],
				customization: {
					templates: {
						siteTemplates: false,
					},
				},
			};

			const { rerender } = render(
				<KitTemplatesCustomizationDialog
					open={ false }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithCustomization }
				/>,
			);

			rerender(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithCustomization }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( false );
		} );
	} );

	describe( 'Toggle Functionality', () => {
		it( 'should toggle site templates switch state when clicked', () => {
			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( true );

			fireEvent.click( siteTemplatesSwitch );
			expect( siteTemplatesSwitch.checked ).toBe( false );

			fireEvent.click( siteTemplatesSwitch );
			expect( siteTemplatesSwitch.checked ).toBe( true );
		} );

		it( 'should handle multiple toggle interactions correctly', () => {
			const dataWithoutTemplates = {
				includes: [],
				customization: {
					templates: null,
				},
			};

			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithoutTemplates }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( false );

			fireEvent.click( siteTemplatesSwitch );
			expect( siteTemplatesSwitch.checked ).toBe( true );

			fireEvent.click( siteTemplatesSwitch );
			expect( siteTemplatesSwitch.checked ).toBe( false );

			fireEvent.click( siteTemplatesSwitch );
			expect( siteTemplatesSwitch.checked ).toBe( true );
		} );
	} );

	describe( 'Dialog Actions', () => {
		it( 'should call handleClose when Cancel button is clicked', () => {
			render(
				<KitTemplatesCustomizationDialog
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
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'templates',
				{
					siteTemplates: true,
				},
			);
			expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should save current toggle state when Save changes is clicked', () => {
			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			fireEvent.click( siteTemplatesSwitch );

			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'templates',
				{
					siteTemplates: false,
				},
			);
		} );

		it( 'should handle save when starting with disabled state', () => {
			const dataWithoutTemplates = {
				includes: [],
				customization: {
					templates: null,
				},
			};

			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithoutTemplates }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			fireEvent.click( siteTemplatesSwitch );

			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'templates',
				{
					siteTemplates: true,
				},
			);
		} );
	} );

	describe( 'Dialog Props', () => {
		it( 'should accept handleClose prop correctly', () => {
			const customHandleClose = jest.fn();

			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ customHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const cancelButton = screen.getByText( 'Cancel' );
			fireEvent.click( cancelButton );

			expect( customHandleClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should accept handleSaveChanges prop correctly', () => {
			const customHandleSaveChanges = jest.fn();

			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ customHandleSaveChanges }
					data={ mockData }
				/>,
			);

			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			expect( customHandleSaveChanges ).toHaveBeenCalledWith(
				'templates',
				{
					siteTemplates: true,
				},
			);
		} );

		it( 'should respect the open prop correctly', () => {
			const { rerender } = render(
				<KitTemplatesCustomizationDialog
					open={ false }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.queryByText( 'Edit templates' ) ).toBeFalsy();

			rerender(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ mockData }
				/>,
			);

			expect( screen.getByText( 'Edit templates' ) ).toBeTruthy();
		} );
	} );

	describe( 'Data Structure Handling', () => {
		it( 'should handle missing customization object gracefully', () => {
			const dataWithoutCustomization = {
				includes: [ 'templates' ],
				customization: {},
			};

			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithoutCustomization }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( true );
		} );

		it( 'should handle missing includes array gracefully', () => {
			const dataWithoutIncludes = {
				includes: [],
				customization: {
					templates: null,
				},
			};

			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithoutIncludes }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( false );
		} );

		it( 'should handle partial customization data correctly', () => {
			const dataWithPartialCustomization = {
				includes: [ 'templates' ],
				customization: {
					templates: {
						// Only partial data - should still work
						siteTemplates: false,
					},
				},
			};

			render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ dataWithPartialCustomization }
				/>,
			);

			const siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( false );
		} );
	} );

	describe( 'useEffect Behavior', () => {
		it( 'should update state when data.customization.templates changes', () => {
			const initialData = {
				includes: [ 'templates' ],
				customization: {
					templates: {
						siteTemplates: true,
					},
				},
			};

			const { rerender } = render(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ initialData }
				/>,
			);

			let siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( true );

			// Update data with different customization
			const updatedData = {
				includes: [ 'templates' ],
				customization: {
					templates: {
						siteTemplates: false,
					},
				},
			};

			rerender(
				<KitTemplatesCustomizationDialog
					open={ true }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ updatedData }
				/>,
			);

			siteTemplatesSwitch = screen.getByRole( 'checkbox' );
			expect( siteTemplatesSwitch.checked ).toBe( false );
		} );

		it( 'should not update state when dialog is closed', () => {
			const initialData = {
				includes: [ 'templates' ],
				customization: {
					templates: {
						siteTemplates: true,
					},
				},
			};

			render(
				<KitTemplatesCustomizationDialog
					open={ false }
					handleClose={ mockHandleClose }
					handleSaveChanges={ mockHandleSaveChanges }
					data={ initialData }
				/>,
			);

			// When dialog is closed, the effect should not run and state should not be set
			expect( screen.queryByRole( 'checkbox' ) ).toBeFalsy();
		} );
	} );
} );
