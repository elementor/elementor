import * as React from 'react';
import { createMockElement, renderWithTheme } from 'test-utils';
import { getElementLabel, type V1Element } from '@elementor/editor-elements';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { saveElementAsComponent } from '../../utils/save-element-as-component';
import { CreateComponentForm } from '../create-component-form';

jest.mock( '../../utils/save-element-as-component' );
jest.mock( '@elementor/editor-elements' );

const mockSaveElementAsComponent = jest.mocked( saveElementAsComponent );
const mockGetElementLabel = jest.mocked( getElementLabel );

const mockElement: V1Element = createMockElement( { model: { id: 'test-element' } } );

describe( 'CreateComponentForm', () => {
	beforeEach( () => {
		mockGetElementLabel.mockReturnValue( 'Div Block' );
	} );

	const triggerOpenFormEvent = ( element = mockElement, anchorPosition = { top: 100, left: 200 } ) => {
		const customEvent = new CustomEvent( 'elementor/editor/open-save-as-component-form', {
			detail: { element, anchorPosition },
		} );

		act( () => window.dispatchEvent( customEvent ) );
	};

	const setupForm = () => {
		renderWithTheme( <CreateComponentForm /> );
		return {
			openForm: () => triggerOpenFormEvent(),
			getComponentNameInput: () => screen.getByRole( 'textbox' ) as HTMLInputElement,
			getCreateButton: () => screen.getByText( 'Create' ),
			getCancelButton: () => screen.getByText( 'Cancel' ),
			fillComponentName: ( name: string ) => {
				const input = screen.getByRole( 'textbox' );
				fireEvent.change( input, { target: { value: name } } );
			},
		};
	};

	const setupSuccessfulSave = () => {
		mockSaveElementAsComponent.mockImplementation( async ( element, name, options ) => {
			await new Promise( ( resolve ) => setTimeout( resolve, 1 ) );
			options?.onSuccess?.( { component_id: 456 } );
		} );
	};

	const setupFailedSave = () => {
		mockSaveElementAsComponent.mockImplementation( async ( element, name, options ) => {
			options?.onError?.( new Error( 'Creation failed' ) );
		} );
	};

	describe( 'Form Opening & Initial State', () => {
		it( 'should not show form initially', () => {
			// Arrange.
			setupForm();

			// Assert.
			expect( screen.queryByText( 'Save as a component' ) ).not.toBeInTheDocument();
		} );

		it( 'should open form when open-save-as-component-form event is dispatched', () => {
			// Arrange.
			setupForm();

			// Act.
			triggerOpenFormEvent();

			// Assert.
			expect( screen.getByText( 'Save as a component' ) ).toBeInTheDocument();
		} );

		it( 'should set component name from element label when form opens', () => {
			// Arrange.
			mockGetElementLabel.mockReturnValue( 'Flexbox' );
			const { openForm, getComponentNameInput: getNameInput } = setupForm();

			// Act.
			openForm();

			// Assert.
			expect( getNameInput().value ).toBe( 'Flexbox' );
		} );
	} );

	describe( 'Input Validation', () => {
		it( 'should disable create button when component name is empty or invalid', () => {
			// Arrange.
			const { openForm, getCreateButton, fillComponentName } = setupForm();
			openForm();

			// Act.
			fillComponentName( '' );

			// Assert.
			expect( getCreateButton() ).toBeDisabled();

			// Act.
			fillComponentName( '   ' );

			// Assert.
			expect( getCreateButton() ).toBeDisabled();
		} );

		it( 'should enable create button when valid name is entered', () => {
			// Arrange.
			const { openForm, getCreateButton, fillComponentName } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );

			// Assert.
			expect( getCreateButton() ).toBeEnabled();
		} );
	} );

	describe( 'Component Creation - Success Flow', () => {
		beforeEach( () => {
			setupSuccessfulSave();
		} );

		it( 'should call saveElementAsComponent with correct parameters when creating', () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			expect( mockSaveElementAsComponent ).toHaveBeenCalledWith(
				mockElement,
				'My Test Component',
				expect.objectContaining( {
					onSuccess: expect.any( Function ),
					onError: expect.any( Function ),
				} )
			);
		} );

		it( 'should show loading state during component creation', () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			expect( screen.getByText( 'Creating…' ) ).toBeInTheDocument();
		} );

		it( 'should disable buttons during loading', () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton, getCancelButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			// Create button should show loading state and be disabled.
			expect( screen.queryByText( 'Create' ) ).not.toBeInTheDocument();
			expect( screen.getByText( 'Creating…' ) ).toBeDisabled();

			// Cancel button should be disabled.
			expect( getCancelButton() ).toBeDisabled();
		} );

		it( 'should show success notification after successful creation', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( screen.getByText( /Component saved successfully/ ) ).toBeInTheDocument();
			} );
		} );

		it( 'should close form after successful creation', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( screen.queryByText( 'Save as a component' ) ).not.toBeInTheDocument();
			} );
		} );
	} );

	describe( 'Error Handling', () => {
		beforeEach( () => {
			setupFailedSave();
		} );

		it( 'should show error notification when creation fails', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( screen.getByText( 'Failed to save component. Please try again.' ) ).toBeInTheDocument();
			} );
		} );

		it( 'should reset loading state after error', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( screen.queryByText( 'Creating…' ) ).not.toBeInTheDocument();
			} );

			// Assert.
			expect( getCreateButton() ).toBeEnabled();
		} );
	} );

	describe( 'Form Lifecycle', () => {
		it( 'should close form when cancel button is clicked', async () => {
			// Arrange.
			const { openForm, getCancelButton } = setupForm();
			openForm();

			// Act.
			fireEvent.click( getCancelButton() );

			// Assert.
			await waitFor( () => {
				expect( screen.queryByText( 'Save as a component' ) ).not.toBeInTheDocument();
			} );
		} );

		it( 'should reset form state when form is closed', () => {
			// Arrange.
			const {
				openForm,
				fillComponentName: fillName,
				getCancelButton,
				getComponentNameInput: getNameInput,
			} = setupForm();
			openForm();
			fillName( 'Test Name' );

			// Act.
			fireEvent.click( getCancelButton() );

			// Reopen form.
			openForm();

			// Assert - should reset to element label.
			expect( getNameInput().value ).toBe( 'Div Block' );
		} );
	} );
} );
