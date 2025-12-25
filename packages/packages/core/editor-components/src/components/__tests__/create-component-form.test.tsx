import * as React from 'react';
import { createMockElement, renderWithStore } from 'test-utils';
import { getElementLabel, replaceElement, type V1ElementModelProps } from '@elementor/editor-elements';
import { __createStore, __dispatch, __registerSlice, type SliceState, type Store } from '@elementor/store';
import { __getState as getState } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { apiClient } from '../../api';
import { selectComponents, slice } from '../../store/store';
import { CreateComponentForm } from '../create-component-form/create-component-form';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../api' );
jest.mock( '@elementor/utils' );
jest.mock( '@elementor/editor-v1-adapters' );

const mockGetElementLabel = jest.mocked( getElementLabel );
const mockGetComponents = jest.mocked( apiClient.get );
const mockReplaceElement = jest.mocked( replaceElement );
const mockGenerateUniqueId = jest.mocked( generateUniqueId );

const mockElement: V1ElementModelProps = createMockElement( { model: { id: 'test-element' } } ).model.toJSON( {
	remove: [ 'default' ],
} );

const GENERATED_UID = 'component-1763024534191-ojwasax';
const EXISTING_COMPONENT_UID = 'component-1763024534191-v9kz881z';

describe( 'CreateComponentForm', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.clearAllMocks();
		__registerSlice( slice );
		store = __createStore();

		mockGetElementLabel.mockReturnValue( 'Div Block' );
		mockGetComponents.mockReturnValue(
			Promise.resolve( [ { name: 'Existing Component', id: 123, uid: EXISTING_COMPONENT_UID } ] )
		);
		mockGenerateUniqueId.mockReturnValue( GENERATED_UID );

		act( () => {
			__dispatch(
				slice.actions.load( [ { name: 'Existing Component', id: 123, uid: EXISTING_COMPONENT_UID } ] )
			);
		} );
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
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<CreateComponentForm />
			</QueryClientProvider>,
			store
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
		it( 'should add component to local store', () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			const spyAddUnpublished = jest.spyOn( slice.actions, 'addUnpublished' );
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			expect( spyAddUnpublished ).toHaveBeenCalledWith(
				expect.objectContaining( {
					uid: GENERATED_UID,
					name: 'My Test Component',
					elements: [ mockElement ],
				} )
			);

			expect( selectComponents( getState() ) ).toEqual( [
				{ uid: GENERATED_UID, name: 'My Test Component' },
				{ id: 123, name: 'Existing Component', uid: EXISTING_COMPONENT_UID },
			] );
		} );

		it( 'should replace original element with component instance', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			expect( mockReplaceElement ).toHaveBeenCalledWith( {
				currentElement: mockElement,
				newElement: expect.objectContaining( {
					elType: 'widget',
					widgetType: 'e-component',
					settings: expect.objectContaining( {
						component_instance: {
							$$type: 'component-instance',
							value: {
								component_id: {
									$$type: 'number',
									value: GENERATED_UID,
								},
							},
						},
					} ),
					editor_settings: expect.objectContaining( {
						component_src_name: 'My Test Component',
						component_uid: GENERATED_UID,
					} ),
				} ),
				withHistory: false,
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
		it( 'should show error notification when replacing element fails', async () => {
			// Arrange.
			mockReplaceElement.mockImplementation( () => {
				throw new Error( 'Failed to replace element' );
			} );

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

			openForm();

			// Assert.
			expect( getNameInput().value ).toBe( 'Div Block' );
		} );
	} );
} );
