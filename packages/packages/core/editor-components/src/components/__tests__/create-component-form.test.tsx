import * as React from 'react';
import { getElementLabel, type V1Element } from '@elementor/editor-elements';
import { render, screen, waitFor, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';

import { saveElementAsComponent } from '../../utils/save-element-as-component';
import { CreateComponentForm } from '../create-component-form';
import { createMockElement, renderWithTheme } from 'test-utils';

jest.mock( '../../utils/save-element-as-component' );
jest.mock( '@elementor/editor-elements' );

const mockSaveElementAsComponent = jest.mocked( saveElementAsComponent );
const mockGetElementLabel = jest.mocked( getElementLabel );

const mockElement: V1Element = createMockElement( { model: { id: 'test-element' } } );

describe( 'CreateComponentForm', () => {
	// Setup & Helper Functions
	beforeEach( () => {
		mockGetElementLabel.mockReturnValue( 'Div Block' );
		jest.clearAllMocks();
	} );

	const triggerOpenFormEvent = ( element = mockElement, anchorPosition = { top: 100, left: 200 } ) => {
		const customEvent = new CustomEvent( 'elementor/editor/open-save-as-component-form', {
			detail: { element, anchorPosition },
		} );

		act( () => {
			window.dispatchEvent( customEvent );
		} );
	};

	const setupForm = () => {
		renderWithTheme( <CreateComponentForm /> );
		return {
			openForm: () => triggerOpenFormEvent(),
			getNameInput: () => screen.getByRole( 'textbox' ) as HTMLInputElement,
			getCreateButton: () => screen.getByText( 'Create' ),
			getCancelButton: () => screen.getByText( 'Cancel' ),
			fillName: ( name: string ) => {
				const input = screen.getByRole( 'textbox' ) as HTMLInputElement;
				fireEvent.change( input, { target: { value: name } } );
			},
		};
	};

	const setupSuccessfulSave = () => {
		mockSaveElementAsComponent.mockImplementation( async ( element, name, options ) => {
			await new Promise( resolve => setTimeout( resolve, 10 ) );
			options?.onSuccess?.( { component_id: 456 } );
		} );
	};

	const setupFailedSave = () => {
		mockSaveElementAsComponent.mockImplementation( async ( element, name, options ) => {
			options?.onError?.( new Error( 'Creation failed' ) );
		} );
	};

	describe( 'Form Opening & Initial State', () => {
		it( 'should not show popover initially', () => {
			// Arrange & Act.
			render( <CreateComponentForm /> );

			// Assert.
			expect( screen.queryByText( 'Save as a component' ) ).not.toBeInTheDocument();
		} );

		it( 'should open form when open-save-as-component-form event is dispatched', () => {
			// Arrange.
			render( <CreateComponentForm /> );

			// Act.
			triggerOpenFormEvent();

			// Assert.
			expect( screen.getByText( 'Save as a component' ) ).toBeInTheDocument();
		} );

		it( 'should set component name from element label when form opens', () => {
			// Arrange.
			mockGetElementLabel.mockReturnValue( 'Custom Element Label' );
			const { openForm, getNameInput } = setupForm();

			// Act.
			openForm();

			// Assert.
			expect( getNameInput().value ).toBe( 'Custom Element Label' );
		} );
	} );

	describe( 'Input Validation', () => {
		it( 'should disable create button when component name is empty or invalid', () => {
			// Arrange.
			const { openForm, getCreateButton, fillName } = setupForm();
			openForm();

			// Act & Assert - empty name.
			fillName( '' );
			expect( getCreateButton() ).toBeDisabled();

			// Act & Assert - whitespace only.
			fillName( '   ' );
			expect( getCreateButton() ).toBeDisabled();

			// Act & Assert - tabs and spaces.
			fillName( '\t  \n  ' );
			expect( getCreateButton() ).toBeDisabled();
		} );

		it( 'should enable create button when valid name is entered', () => {
			// Arrange.
			const { openForm, getCreateButton, fillName } = setupForm();
			openForm();

			// Act.
			fillName( 'Valid Component Name' );

			// Assert.
			expect( getCreateButton() ).not.toBeDisabled();
		} );
	} );

	describe( 'Component Creation Success Flow', () => {
		beforeEach( () => {
			setupSuccessfulSave();
		} );

		it( 'should call saveElementAsComponent with correct parameters when creating', () => {
			// Arrange.
			const { openForm, fillName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillName( 'My Test Component' );
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
			const { openForm, fillName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillName( 'Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			expect( screen.getByText( 'Creating…' ) ).toBeInTheDocument();
		} );

		it( 'should disable buttons during loading', () => {
			// Arrange.
			const { openForm, fillName, getCreateButton, getCancelButton } = setupForm();
			openForm();

			// Act.
			fillName( 'Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			expect( getCreateButton() ).toBeDisabled();
			expect( getCancelButton() ).toBeDisabled();
		} );

		it( 'should show success notification after successful creation', async () => {
			// Arrange.
			const { openForm, fillName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillName( 'Success Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( screen.getByText( /Component saved successfully/ ) ).toBeInTheDocument();
			} );
		} );

		it( 'should close form after successful creation', async () => {
			// Arrange.
			const { openForm, fillName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillName( 'Success Component' );
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
			const { openForm, fillName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillName( 'Failed Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( screen.getByText( 'Failed to save component. Please try again.' ) ).toBeInTheDocument();
			} );
		} );

		it( 'should reset loading state after error', async () => {
			// Arrange.
			const { openForm, fillName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillName( 'Failed Component' );
			fireEvent.click( getCreateButton() );

			// Assert - loading state should be gone.
			await waitFor( () => {
				expect( screen.queryByText( 'Creating…' ) ).not.toBeInTheDocument();
			} );

			// Assert - create button should be enabled again.
			expect( getCreateButton() ).not.toBeDisabled();
		} );
	} );

	describe( 'Form Lifecycle', () => {
		it( 'should close form when cancel button is clicked', () => {
			// Arrange.
			const { openForm, getCancelButton } = setupForm();
			openForm();

			// Act.
			fireEvent.click( getCancelButton() );

			// Assert.
			expect( screen.queryByText( 'Save as a component' ) ).not.toBeInTheDocument();
		} );

		it( 'should reset form state when form is closed', () => {
			// Arrange.
			const { openForm, fillName, getCancelButton, getNameInput } = setupForm();
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