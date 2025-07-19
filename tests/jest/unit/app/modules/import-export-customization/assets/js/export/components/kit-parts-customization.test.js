import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportKitPartsSelection from 'elementor/app/modules/import-export-customization/assets/js/export/components/export-kit-parts-selection';

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/kit-content-data', () => {
	/**
	 * Generic dialog component factory
	 * Creates a mock dialog component for any content type
	 *
	 * @param {string} type - The type of content (content, templates, settings, plugins)
	 * @return {Function} A React component that renders the mock dialog
	 */
	const createMockDialog = ( type ) => {
		// eslint-disable-next-line react/prop-types
		const MockDialog = ( { open, handleClose } ) => {
			if ( ! open ) {
				return null;
			}

			return (
				<div data-testid={ `kit-${ type }-dialog` }>
					<div data-testid="dialog-open-state">open</div>
					<div data-testid="dialog-type">{ type }</div>
					<button data-testid="dialog-close-button" onClick={ handleClose }>
						Close Dialog
					</button>
				</div>
			);
		};

		MockDialog.displayName = `Mock${ type.charAt( 0 ).toUpperCase() + type.slice( 1 ) }Dialog`;

		return MockDialog;
	};

	return [
		{
			type: 'content',
			data: {
				title: 'Content',
				features: {
					open: [
						'Elementor Pages',
						'Landing Pages',
					],
				},
			},
			dialog: createMockDialog( 'content' ),
		},
		{
			type: 'templates',
			data: {
				title: 'Templates',
				features: {
					open: [
						'Saved Templates',
						'Headers',
					],
				},
			},
			dialog: createMockDialog( 'templates' ),
		},
		{
			type: 'settings',
			data: {
				title: 'Settings & configurations',
				features: {
					open: [
						'Global Colors',
						'Global Fonts',
					],
				},
			},
			dialog: createMockDialog( 'settings' ),
		},
		{
			type: 'plugins',
			data: {
				title: 'Plugins',
				features: {
					open: [
						'All plugins are required for this website templates work',
					],
				},
			},
			dialog: createMockDialog( 'plugins' ),
		},
	];
} );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context', () => ( {
	useExportContext: jest.fn(),
} ) );

global.__ = jest.fn( ( text ) => text );

import { useExportContext } from 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context';

const getCheckboxByType = ( container, type ) => {
	const checkboxContainer = container.querySelector( `[data-type="${ type }"]` );
	return checkboxContainer ? checkboxContainer.querySelector( 'input[type="checkbox"]' ) : null;
};

describe( 'ExportKitPartsSelection Component', () => {
	let mockDispatch;

	beforeEach( () => {
		mockDispatch = jest.fn();

		useExportContext.mockReturnValue( {
			data: {
				includes: [ 'content', 'templates', 'settings' ],
			},
			dispatch: mockDispatch,
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Component Rendering', () => {
		it( 'should render all kit content items', () => {
			render( <ExportKitPartsSelection /> );

			expect( screen.getByText( 'Content' ) ).toBeTruthy();
			expect( screen.getByText( 'Templates' ) ).toBeTruthy();
			expect( screen.getByText( 'Settings & configurations' ) ).toBeTruthy();
			expect( screen.getByText( 'Plugins' ) ).toBeTruthy();
		} );

		it( 'should have dialog configured for all items', () => {
			const kitContentData = require( 'elementor/app/modules/import-export-customization/assets/js/shared/kit-content-data' );

			kitContentData.forEach( ( item ) => {
				expect( item.dialog ).toBeTruthy();
				expect( typeof item.dialog ).toBe( 'function' );
			} );
		} );

		it( 'should render item descriptions with features', () => {
			render( <ExportKitPartsSelection /> );

			expect( screen.getByText( 'Elementor Pages, Landing Pages' ) ).toBeTruthy();
			expect( screen.getByText( 'Saved Templates, Headers' ) ).toBeTruthy();
			expect( screen.getByText( 'Global Colors, Global Fonts' ) ).toBeTruthy();
			expect( screen.getByText( 'All plugins are required for this website templates work' ) ).toBeTruthy();
		} );

		it( 'should render checkboxes for each item', () => {
			render( <ExportKitPartsSelection /> );

			const checkboxes = screen.getAllByRole( 'checkbox' );
			expect( checkboxes ).toHaveLength( 4 );
		} );

		it( 'should render Edit buttons for all items', () => {
			render( <ExportKitPartsSelection /> );

			const editButtons = screen.getAllByText( 'Edit' );
			expect( editButtons ).toHaveLength( 4 );

			const buttonTypes = [ 'content', 'templates', 'settings', 'plugins' ];
			buttonTypes.forEach( ( type ) => {
				const button = screen.getByText( 'Edit', {
					selector: `[data-type="${ type }"]`,
				} );
				expect( button ).toBeTruthy();
			} );
		} );
	} );

	describe( 'Checkbox State Management', () => {
		it( 'should show checked state for items in includes array', () => {
			const { container } = render( <ExportKitPartsSelection /> );

			const contentCheckbox = getCheckboxByType( container, 'content' );
			const templatesCheckbox = getCheckboxByType( container, 'templates' );
			const settingsCheckbox = getCheckboxByType( container, 'settings' );
			const pluginsCheckbox = getCheckboxByType( container, 'plugins' );

			expect( contentCheckbox.checked ).toBe( true );
			expect( templatesCheckbox.checked ).toBe( true );
			expect( settingsCheckbox.checked ).toBe( true );
			expect( pluginsCheckbox.checked ).toBe( false );
		} );

		it( 'should show unchecked state for items not in includes array', () => {
			useExportContext.mockReturnValue( {
				data: {
					includes: [ 'content' ],
				},
				dispatch: mockDispatch,
			} );

			const { container } = render( <ExportKitPartsSelection /> );

			const contentCheckbox = getCheckboxByType( container, 'content' );
			const templatesCheckbox = getCheckboxByType( container, 'templates' );
			const settingsCheckbox = getCheckboxByType( container, 'settings' );
			const pluginsCheckbox = getCheckboxByType( container, 'plugins' );

			expect( contentCheckbox.checked ).toBe( true );
			expect( templatesCheckbox.checked ).toBe( false );
			expect( settingsCheckbox.checked ).toBe( false );
			expect( pluginsCheckbox.checked ).toBe( false );
		} );

		it( 'should handle empty includes array', () => {
			useExportContext.mockReturnValue( {
				data: {
					includes: [],
				},
				dispatch: mockDispatch,
			} );

			const { container } = render( <ExportKitPartsSelection /> );

			// Use data-type attributes instead of iterating through checkboxes array
			const contentCheckbox = getCheckboxByType( container, 'content' );
			const templatesCheckbox = getCheckboxByType( container, 'templates' );
			const settingsCheckbox = getCheckboxByType( container, 'settings' );
			const pluginsCheckbox = getCheckboxByType( container, 'plugins' );

			expect( contentCheckbox.checked ).toBe( false );
			expect( templatesCheckbox.checked ).toBe( false );
			expect( settingsCheckbox.checked ).toBe( false );
			expect( pluginsCheckbox.checked ).toBe( false );
		} );

		it( 'should handle all items included', () => {
			useExportContext.mockReturnValue( {
				data: {
					includes: [ 'content', 'templates', 'settings', 'plugins' ],
				},
				dispatch: mockDispatch,
			} );

			const { container } = render( <ExportKitPartsSelection /> );

			// Use data-type attributes instead of iterating through checkboxes array
			const contentCheckbox = getCheckboxByType( container, 'content' );
			const templatesCheckbox = getCheckboxByType( container, 'templates' );
			const settingsCheckbox = getCheckboxByType( container, 'settings' );
			const pluginsCheckbox = getCheckboxByType( container, 'plugins' );

			expect( contentCheckbox.checked ).toBe( true );
			expect( templatesCheckbox.checked ).toBe( true );
			expect( settingsCheckbox.checked ).toBe( true );
			expect( pluginsCheckbox.checked ).toBe( true );
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should dispatch ADD_INCLUDE when unchecked item is clicked', () => {
			render( <ExportKitPartsSelection /> );

			const pluginsContainer = document.querySelector( '[data-type="plugins"]' );
			const pluginsCheckbox = pluginsContainer.querySelector( 'input[type="checkbox"]' );

			fireEvent.click( pluginsCheckbox );

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'ADD_INCLUDE',
				payload: 'plugins',
			} );
		} );

		it( 'should dispatch REMOVE_INCLUDE when checked item is clicked', () => {
			render( <ExportKitPartsSelection /> );

			// Get content checkbox by data-type
			const contentContainer = document.querySelector( '[data-type="content"]' );
			const contentCheckbox = contentContainer.querySelector( 'input[type="checkbox"]' );

			fireEvent.click( contentCheckbox );

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'REMOVE_INCLUDE',
				payload: 'content',
			} );
		} );

		it( 'should handle multiple checkbox interactions', () => {
			const { container } = render( <ExportKitPartsSelection /> );

			fireEvent.click( getCheckboxByType( container, 'plugins' ) );
			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'ADD_INCLUDE',
				payload: 'plugins',
			} );

			fireEvent.click( getCheckboxByType( container, 'content' ) );
			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'REMOVE_INCLUDE',
				payload: 'content',
			} );

			expect( mockDispatch ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should open dialog when Edit button is clicked', () => {
			render( <ExportKitPartsSelection /> );

			const settingsEditButton = screen.getByText( 'Edit', {
				selector: '[data-type="settings"]',
			} );
			fireEvent.click( settingsEditButton );

			const dialogState = screen.getByTestId( 'dialog-open-state' );
			expect( dialogState.textContent ).toBe( 'open' );

			const dialogType = screen.getByTestId( 'dialog-type' );
			expect( dialogType.textContent ).toBe( 'settings' );
		} );

		it( 'should handle all edit buttons correctly', () => {
			render( <ExportKitPartsSelection /> );

			const editButtons = screen.getAllByText( 'Edit' );
			expect( editButtons ).toHaveLength( 4 );

			const buttonTypes = [ 'content', 'templates', 'settings', 'plugins' ];

			buttonTypes.forEach( ( type ) => {
				const button = screen.getByText( 'Edit', {
					selector: `[data-type="${ type }"]`,
				} );
				fireEvent.click( button );

				const dialogState = screen.getByTestId( 'dialog-open-state' );
				expect( dialogState.textContent ).toBe( 'open' );

				const dialogType = screen.getByTestId( 'dialog-type' );
				expect( dialogType.textContent ).toBe( type );

				const closeButton = screen.getByTestId( 'dialog-close-button' );
				fireEvent.click( closeButton );

				const closedDialog = screen.queryByTestId( 'dialog-open-state' );
				expect( closedDialog ).toBeNull();
			} );
		} );

		it( 'should close dialog when handleClose is called', () => {
			render( <ExportKitPartsSelection /> );

			const settingsEditButton = screen.getByText( 'Edit', {
				selector: '[data-type="settings"]',
			} );
			fireEvent.click( settingsEditButton );

			let dialogState = screen.getByTestId( 'dialog-open-state' );
			expect( dialogState.textContent ).toBe( 'open' );

			const closeButton = screen.getByTestId( 'dialog-close-button' );
			fireEvent.click( closeButton );

			dialogState = screen.queryByTestId( 'dialog-open-state' );
			expect( dialogState ).toBeNull();
		} );
	} );

	describe( 'Context Integration', () => {
		it( 'should use data from export context', () => {
			const mockData = {
				includes: [ 'content', 'settings' ],
			};

			useExportContext.mockReturnValue( {
				data: mockData,
				dispatch: mockDispatch,
			} );

			const { container } = render( <ExportKitPartsSelection /> );

			// Use data-type attributes instead of array indexes
			expect( getCheckboxByType( container, 'content' ).checked ).toBe( true );
			expect( getCheckboxByType( container, 'templates' ).checked ).toBe( false );
			expect( getCheckboxByType( container, 'settings' ).checked ).toBe( true );
			expect( getCheckboxByType( container, 'plugins' ).checked ).toBe( false );
		} );

		it( 'should handle context data changes', () => {
			const { rerender, container } = render( <ExportKitPartsSelection /> );

			// Initially content is checked
			expect( getCheckboxByType( container, 'content' ).checked ).toBe( true );

			// Update context data
			useExportContext.mockReturnValue( {
				data: {
					includes: [ 'templates', 'plugins' ],
				},
				dispatch: mockDispatch,
			} );

			rerender( <ExportKitPartsSelection /> );

			expect( getCheckboxByType( container, 'content' ).checked ).toBe( false );
			expect( getCheckboxByType( container, 'templates' ).checked ).toBe( true );
			expect( getCheckboxByType( container, 'settings' ).checked ).toBe( false );
			expect( getCheckboxByType( container, 'plugins' ).checked ).toBe( true );
		} );
	} );

	describe( 'Dialog Management', () => {
		it( 'should support future dialog types with generic factory', () => {
			// Demonstrating how easy it is to add new dialog types
			const mockCreateDialog = ( type ) => {
				// eslint-disable-next-line react/prop-types
				const MockDialog = ( { open, handleClose } ) => {
					if ( ! open ) {
						return null;
					}
					return (
						<div data-testid={ `kit-${ type }-dialog` }>
							<div data-testid="dialog-open-state">open</div>
							<div data-testid="dialog-type">{ type }</div>
							<button data-testid="dialog-close-button" onClick={ handleClose }>
								Close Dialog
							</button>
						</div>
					);
				};

				return MockDialog;
			};

			// Test a hypothetical new dialog type
			const NewDialog = mockCreateDialog( 'new-feature' );
			const mockHandleClose = jest.fn();

			const { rerender } = render( <NewDialog open={ true } handleClose={ mockHandleClose } /> );

			expect( screen.getByTestId( 'dialog-type' ).textContent ).toBe( 'new-feature' );
			expect( screen.getByTestId( 'kit-new-feature-dialog' ) ).toBeTruthy();

			// Cleanup
			rerender( <NewDialog open={ false } handleClose={ mockHandleClose } /> );
		} );
		it( 'should have dialog closed by default', () => {
			render( <ExportKitPartsSelection /> );

			// Dialog should not be rendered when closed
			const dialogState = screen.queryByTestId( 'dialog-open-state' );
			expect( dialogState ).toBeNull();
		} );

		it( 'should maintain dialog state independently', () => {
			render( <ExportKitPartsSelection /> );

			// Open dialog
			const settingsEditButton = screen.getByText( 'Edit', {
				selector: '[data-type="settings"]',
			} );
			fireEvent.click( settingsEditButton );

			// Click a checkbox - should not affect dialog state
			const contentContainer = document.querySelector( '[data-type="content"]' );
			const contentCheckbox = contentContainer.querySelector( 'input[type="checkbox"]' );
			fireEvent.click( contentCheckbox );

			// Dialog should still be open
			const dialogState = screen.getByTestId( 'dialog-open-state' );
			expect( dialogState.textContent ).toBe( 'open' );
		} );

		it( 'should render correct dialog component for each type', () => {
			render( <ExportKitPartsSelection /> );

			const types = [ 'content', 'templates', 'settings', 'plugins' ];

			types.forEach( ( type ) => {
				const testId = `kit-${ type }-dialog`;
				// Open dialog for this type
				const editButton = screen.getByText( 'Edit', {
					selector: `[data-type="${ type }"]`,
				} );
				fireEvent.click( editButton );

				// Verify correct dialog is rendered
				const dialog = screen.getByTestId( testId );
				expect( dialog ).toBeTruthy();

				// Verify dialog has correct type
				const dialogType = screen.getByTestId( 'dialog-type' );
				expect( dialogType.textContent ).toBe( type );

				// Dialog should have close button
				const closeButton = screen.getByTestId( 'dialog-close-button' );
				expect( closeButton ).toBeTruthy();

				// Close dialog for next iteration
				fireEvent.click( closeButton );

				// Verify dialog is closed
				const closedDialog = screen.queryByTestId( testId );
				expect( closedDialog ).toBeNull();
			} );
		} );
	} );
} );
