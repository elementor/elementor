import * as React from 'react';
import { SnackbarProvider } from 'notistack';
import { createMockContainer, createMockElement, renderWithStore } from 'test-utils';
import {
	createElements,
	deleteElement,
	getContainer,
	getElementLabel,
	replaceElement,
	type V1ElementModelProps,
} from '@elementor/editor-elements';
import { notify } from '@elementor/editor-notifications';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __createStore, __dispatch, __registerSlice, type SliceState, type Store } from '@elementor/store';
import { __getState as getState } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { apiClient } from '../../api';
import { selectComponents, slice } from '../../store/store';
import { switchToComponent } from '../../utils/switch-to-component';
import { CreateComponentForm } from '../create-component-form/create-component-form';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../api' );
jest.mock( '@elementor/utils' );
jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../../utils/switch-to-component' );
jest.mock( '@elementor/editor-notifications' );

const mockGetElementLabel = jest.mocked( getElementLabel );
const mockGetContainer = jest.mocked( getContainer );
const mockGetComponents = jest.mocked( apiClient.get );
const mockReplaceElement = jest.mocked( replaceElement );
const mockDeleteElement = jest.mocked( deleteElement );
const mockCreateElements = jest.mocked( createElements );
const mockGenerateUniqueId = jest.mocked( generateUniqueId );
const mockRunCommand = jest.mocked( runCommand );
const mockSwitchToComponent = jest.mocked( switchToComponent );
const mockNotify = jest.mocked( notify );

const mockElement: V1ElementModelProps = createMockElement( { model: { id: 'test-element' } } ).model.toJSON( {
	remove: [ 'default' ],
} );

const GENERATED_UID = 'component-1763024534191-ojwasax';
const EXISTING_COMPONENT_UID = 'component-1763024534191-v9kz881z';

const EXISTING_COMPONENT_ID = 123;
const PUBLISHED_COMPONENT_ID = 456;

const CREATED_COMPONENT_INSTANCE_ID = 'test-component-instance-id';

describe( 'CreateComponentForm', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.clearAllMocks();
		__registerSlice( slice );
		store = __createStore();

		mockGetElementLabel.mockReturnValue( 'Div Block' );
		mockGetContainer.mockReturnValue( {
			model: {
				toJSON: () => mockElement,
			},
			parent: { id: 'parent-container-id' },
			view: { _index: 0 },
		} as ReturnType< typeof getContainer > );
		mockGetComponents.mockReturnValue(
			Promise.resolve( [
				{ name: 'Existing Component', id: EXISTING_COMPONENT_ID, uid: EXISTING_COMPONENT_UID },
			] )
		);
		mockGenerateUniqueId.mockReturnValue( GENERATED_UID );
		mockRunCommand.mockImplementation( ( command: string ) => {
			if ( command === 'document/save/auto' ) {
				__dispatch(
					slice.actions.add( { id: PUBLISHED_COMPONENT_ID, name: 'My Test Component', uid: GENERATED_UID } )
				);
				__dispatch( slice.actions.resetUnpublished() );
			}
			return Promise.resolve();
		} );
		mockReplaceElement.mockResolvedValue( createMockElement( { model: { id: CREATED_COMPONENT_INSTANCE_ID } } ) );

		act( () => {
			__dispatch(
				slice.actions.load( [
					{ name: 'Existing Component', id: EXISTING_COMPONENT_ID, uid: EXISTING_COMPONENT_UID },
				] )
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
				<SnackbarProvider>
					<CreateComponentForm />
				</SnackbarProvider>
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
			expect( screen.queryByText( 'Create component' ) ).not.toBeInTheDocument();
		} );

		it( 'should open form when open-save-as-component-form event is dispatched', () => {
			// Arrange.
			setupForm();

			// Act.
			triggerOpenFormEvent();

			// Assert.
			expect( screen.getByText( 'Create component' ) ).toBeInTheDocument();
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
		it( 'should add component to local store', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			const spyAddUnpublished = jest.spyOn( slice.actions, 'addUnpublished' );
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( spyAddUnpublished ).toHaveBeenCalledWith(
					expect.objectContaining( {
						uid: GENERATED_UID,
						name: 'My Test Component',
						elements: [ mockElement ],
					} )
				);
			} );

			expect( selectComponents( getState() ) ).toEqual( [
				{ id: PUBLISHED_COMPONENT_ID, name: 'My Test Component', uid: GENERATED_UID },
				{ id: EXISTING_COMPONENT_ID, name: 'Existing Component', uid: EXISTING_COMPONENT_UID },
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
			await waitFor( () => {
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
							component_uid: GENERATED_UID,
						} ),
					} ),
					withHistory: false,
				} );
			} );
		} );

		it( 'should enter component edit mode after successful creation', async () => {
			// Arrange.
			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( mockSwitchToComponent ).toHaveBeenCalledWith(
					PUBLISHED_COMPONENT_ID,
					CREATED_COMPONENT_INSTANCE_ID
				);
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
				expect( mockNotify ).toHaveBeenCalledWith( {
					type: 'success',
					message: 'Component created successfully.',
					id: `component-saved-successfully-${ GENERATED_UID }`,
				} );
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
				expect( screen.queryByText( 'Create component' ) ).not.toBeInTheDocument();
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
				expect( mockNotify ).toHaveBeenCalledWith( {
					type: 'error',
					message: 'Failed to create component. Please try again.',
					id: 'component-save-failed',
				} );
			} );
		} );

		it( 'should show error notification when auto-save fails', async () => {
			// Arrange.
			mockRunCommand.mockImplementation( ( command: string ) => {
				if ( command === 'document/save/auto' ) {
					return Promise.reject( new Error( 'Auto-save failed' ) );
				}
				return Promise.resolve();
			} );

			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( mockNotify ).toHaveBeenCalledWith( {
					type: 'error',
					message: 'Failed to create component. Please try again.',
					id: 'component-save-failed',
				} );
			} );
		} );

		it( 'should close form when auto-save fails', async () => {
			// Arrange.
			mockRunCommand.mockImplementation( ( command: string ) => {
				if ( command === 'document/save/auto' ) {
					return Promise.reject( new Error( 'Auto-save failed' ) );
				}
				return Promise.resolve();
			} );

			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( screen.queryByText( 'Create component' ) ).not.toBeInTheDocument();
			} );
		} );

		it( 'should remove unpublished component from store when auto-save fails', async () => {
			// Arrange.
			mockRunCommand.mockImplementation( ( command: string ) => {
				if ( command === 'document/save/auto' ) {
					return Promise.reject( new Error( 'Auto-save failed' ) );
				}
				return Promise.resolve();
			} );

			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				const components = selectComponents( getState() );
				const unpublishedComponent = components.find( ( c ) => c.name === 'My Test Component' );
				expect( unpublishedComponent ).toBeUndefined();
			} );
		} );

		it( 'should restore original element when auto-save fails', async () => {
			// Arrange.
			mockRunCommand.mockImplementation( ( command: string ) => {
				if ( command === 'document/save/auto' ) {
					return Promise.reject( new Error( 'Auto-save failed' ) );
				}
				return Promise.resolve();
			} );

			const componentInstanceContainer = createMockContainer( CREATED_COMPONENT_INSTANCE_ID );

			mockGetContainer.mockImplementation( ( id: string ) => {
				if ( id === CREATED_COMPONENT_INSTANCE_ID ) {
					return componentInstanceContainer;
				}

				return createMockContainer( id );
			} );

			const { openForm, fillComponentName, getCreateButton } = setupForm();
			openForm();

			// Act.
			fillComponentName( 'My Test Component' );
			fireEvent.click( getCreateButton() );

			// Assert.
			await waitFor( () => {
				expect( mockDeleteElement ).toHaveBeenCalledWith( {
					container: componentInstanceContainer,
					options: { useHistory: false },
				} );
			} );

			await waitFor( () => {
				expect( mockCreateElements ).toHaveBeenCalledWith(
					expect.objectContaining( {
						elements: expect.arrayContaining( [
							expect.objectContaining( {
								model: expect.objectContaining( {
									id: mockElement.id,
								} ),
							} ),
						] ),
					} )
				);
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
				expect( screen.queryByText( 'Create component' ) ).not.toBeInTheDocument();
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

	describe( 'Component Count Validation', () => {
		const loadMockComponents = ( count: number, isArchived: boolean = false ) => {
			const components = Array.from( { length: count }, ( _, i ) => ( {
				id: i + 1,
				name: `Component ${ i + 1 }`,
				uid: `component-uid-${ i + 1 }`,
				isArchived,
			} ) );

			act( () => {
				__dispatch( slice.actions.load( components ) );
			} );
		};

		const MAX_COMPONENTS_NOTIFICATION = {
			type: 'default',
			message:
				"You've reached the limit of 100 components. Please remove an existing one to create a new component.",
			id: 'maximum-number-of-components-exceeded',
		};

		it.each( [
			{ count: 100, shouldOpen: false, expected: 'not open' },
			{ count: 101, shouldOpen: false, expected: 'not open' },
			{ count: 99, shouldOpen: true, expected: 'open' },
			{ count: 50, shouldOpen: true, expected: 'open' },
		] )( 'should %(expected) when existing component count is %(count)', ( { count, shouldOpen } ) => {
			// Arrange.
			loadMockComponents( count );

			setupForm();

			// Act.
			triggerOpenFormEvent();

			// Assert.
			if ( shouldOpen ) {
				expect( screen.getByText( 'Create component' ) ).toBeInTheDocument();
				expect( mockNotify ).not.toHaveBeenCalled();
			} else {
				expect( screen.queryByText( 'Create component' ) ).not.toBeInTheDocument();
				expect( mockNotify ).toHaveBeenCalledWith( MAX_COMPONENTS_NOTIFICATION );
			}
		} );

		it( 'should not count archived components for count validation', () => {
			// Arrange.
			// 90 active components
			loadMockComponents( 90 );
			// 20 archived components
			loadMockComponents( 20, true );

			setupForm();

			// Act.
			triggerOpenFormEvent();

			// Assert.
			expect( screen.getByText( 'Create component' ) ).toBeInTheDocument();
			expect( mockNotify ).not.toHaveBeenCalled();
		} );
	} );
} );
