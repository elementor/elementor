import * as React from 'react';
import { createMockElement, renderWithTheme } from 'test-utils';
import { getElementLabel, replaceElement, type V1Element } from '@elementor/editor-elements';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { apiClient } from '../../api';
import { CreateComponentForm } from '../create-component-form/create-component-form';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../api' );

const mockGetElementLabel = jest.mocked( getElementLabel );

const mockCreateComponent = jest.mocked( apiClient.create );
const mockGetComponents = jest.mocked( apiClient.get );

const mockReplaceElement = jest.mocked( replaceElement );

const mockElement: V1Element = createMockElement( { model: { id: 'test-element' } } );
const mockComponentId = 123245;

describe( 'CreateComponentForm', () => {
	beforeEach( () => {
		mockGetElementLabel.mockReturnValue( 'Div Block' );
		mockGetComponents.mockReturnValue( Promise.resolve( [ { name: 'Existing Component', id: 123 } ] ) );
	} );

	const triggerOpenFormEvent = ( element = mockElement, anchorPosition = { top: 100, left: 200 } ) => {
		const customEvent = new CustomEvent( 'elementor/editor/open-save-as-component-form', {
			detail: { element, anchorPosition },
		} );

		act( () => window.dispatchEvent( customEvent ) );
	};

	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );

	const setupForm = () => {
		renderWithTheme(
			<QueryClientProvider client={ queryClient }>
				<CreateComponentForm />
			</QueryClientProvider>
		);
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
		mockCreateComponent.mockImplementation( async () => {
			await new Promise( ( resolve ) => setTimeout( resolve, 10 ) );
			return Promise.resolve( { component_id: mockComponentId } );
		} );
	};

	const setupFailedSave = () => {
		mockCreateComponent.mockRejectedValue( new Error( 'Creation failed' ) );
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
		it( 'should disable submit when component name is empty', () => {
			// Arrange.
			const { openForm, getCreateButton, fillComponentName } = setupForm();
			openForm();

			// Act.
			fillComponentName( '' );
			fireEvent.click( getCreateButton() );

			// Assert.
			expect( screen.getByText( 'Component name is required.' ) ).toBeInTheDocument();
			expect( getCreateButton() ).toBeDisabled();
			expect( mockCreateComponent ).not.toHaveBeenCalled();
		} );

		it( 'should disable submit when component name is only whitespace', () => {
			// Arrange.
			const { openForm, getCreateButton, fillComponentName } = setupForm();
			openForm();

			// Act.
			fillComponentName( '   ' );
			fireEvent.click( getCreateButton() );

			// Assert.
			expect( screen.getByText( 'Component name is required.' ) ).toBeInTheDocument();
			expect( getCreateButton() ).toBeDisabled();
			expect( mockCreateComponent ).not.toHaveBeenCalled();
		} );

		it( 'should disable submit when component name is too short (< 2 chars)', () => {
			// Arrange.
			const { openForm, getCreateButton, fillComponentName } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'A' );
			fireEvent.click( getCreateButton() );

			// Assert.
			expect( getCreateButton() ).toBeDisabled();
			expect(
				screen.getByText( 'Component name is too short. Please enter at least 2 characters.' )
			).toBeInTheDocument();
			expect( mockCreateComponent ).not.toHaveBeenCalled();
		} );

		it( 'should disable submit when component name is too long (> 50 chars)', () => {
			// Arrange.
			const { openForm, getCreateButton, fillComponentName } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'A'.repeat( 51 ) );

			// Assert.
			expect( getCreateButton() ).toBeDisabled();
			expect(
				screen.getByText( 'Component name is too long. Please keep it under 50 characters.' )
			).toBeInTheDocument();
		} );

		it( 'should disable submit when component name already exists', () => {
			// Arrange.
			const { openForm, getCreateButton, fillComponentName } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'Existing Component' );

			// Assert.
			expect( getCreateButton() ).toBeDisabled();
			expect( screen.getByText( 'Component name already exists' ) ).toBeInTheDocument();
		} );

		it( 'should re-enable submit, and clear errors when valid name is entered', () => {
			// Arrange.
			const { openForm, getCreateButton, fillComponentName } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'A'.repeat( 51 ) );

			// Assert.
			expect( getCreateButton() ).toBeDisabled();
			expect(
				screen.getByText( 'Component name is too long. Please keep it under 50 characters.' )
			).toBeInTheDocument();

			// Act.
			fillComponentName( 'My Test Component' );

			// Assert.
			expect( getCreateButton() ).toBeEnabled();
			expect(
				screen.queryByText( 'Component name is too long. Please keep it under 50 characters.' )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'Component Creation - Success Flow', () => {
		beforeEach( () => {
			setupSuccessfulSave();
		} );

		it( 'should call create component with correct parameters', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( mockCreateComponent ).toHaveBeenCalledWith(
					expect.objectContaining( {
						name: 'My Test Component',
						content: [ mockElement.model.toJSON( { remove: [ 'default' ] } ) ],
					} )
				);
			} );
		} );

		it( 'should show loading state during component creation', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( screen.getByText( 'Creating…' ) ).toBeInTheDocument();
			} );
		} );

		it( 'should disable buttons during loading', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton, getCancelButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			// Create button should show loading state and be disabled.
			await waitFor( () => {
				expect( screen.queryByText( 'Create' ) ).not.toBeInTheDocument();
			} );
			expect( screen.getByText( 'Creating…' ) ).toBeDisabled();

			// Cancel button should be disabled.
			expect( getCancelButton() ).toBeDisabled();
		} );

		it( 'should call replace element with correct parameters after successful creation', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( mockReplaceElement ).toHaveBeenCalledWith( {
					currentElement: mockElement,
					newElement: {
						elType: 'widget',
						widgetType: 'e-component',
						settings: {
							component_id: {
								$$type: 'number',
								value: mockComponentId,
							},
						},
					},
					withHistory: false,
				} );
			} );
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
