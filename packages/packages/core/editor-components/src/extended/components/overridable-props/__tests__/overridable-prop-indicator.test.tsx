import * as React from 'react';
import { createMockPropType, renderWithStore } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { useElement } from '@elementor/editor-editing-panel';
import { getElementSetting, getWidgetsCache, type V1Element } from '@elementor/editor-elements';
import { stringPropTypeUtil, type TransformablePropValue } from '@elementor/editor-props';
import {
	__createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice,
	type Store,
} from '@elementor/store';
import { fireEvent, screen } from '@testing-library/react';

import { componentInstanceOverridePropTypeUtil } from '../../../../prop-types/component-instance-override-prop-type';
import { componentInstanceOverridesPropTypeUtil } from '../../../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../../../prop-types/component-overridable-prop-type';
import { OverridablePropProvider } from '../../../../provider/overridable-prop-context';
import { type ComponentsSlice, selectOverridableProps, slice } from '../../../../store/store';
import { type PublishedComponent } from '../../../../types';
import { getContainerByOriginId } from '../../../../utils/get-container-by-origin-id';
import { OverridablePropIndicator } from '../overridable-prop-indicator';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	useBoundProp: jest.fn(),
} ) );
jest.mock( '@elementor/editor-editing-panel', () => ( {
	...jest.requireActual( '@elementor/editor-editing-panel' ),
	useElement: jest.fn(),
} ) );
jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getWidgetsCache: jest.fn(),
	getElementSetting: jest.fn(),
} ) );
jest.mock( '../../../../utils/get-container-by-origin-id', () => ( {
	getContainerByOriginId: jest.fn(),
} ) );

const MOCK_ELEMENT_ID = 'test-element-123';
const MOCK_COMPONENT_ID = 456;
const MOCK_WIDGET_TYPE = 'e-heading';
const MOCK_EL_TYPE = 'widget';
const MOCK_OVERRIDABLE_KEY = 'mock-overridable-key';

describe( 'OverridablePropIndicator', () => {
	let store: Store< ComponentsSlice >;

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();

		jest.mocked( useElement ).mockReturnValue( {
			element: { id: MOCK_ELEMENT_ID, type: MOCK_WIDGET_TYPE },
			elementType: { key: MOCK_WIDGET_TYPE, propsSchema: {}, controls: [], title: 'Test Element' },
		} );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it.each( [
		{
			should: 'not show indicator on fields when not editing a component',
			bind: 'title',
			currentValue: stringPropTypeUtil.create( 'Test' ),
			overridableData: {
				label: 'Test',
				groupId: 'default',
			},
			isComponent: false,
			expect: {
				isShowingIndicator: false,
				isChecked: false,
			},
		},
		{
			should: 'be a plus icon if prop is not overridable',
			bind: 'title',
			currentValue: stringPropTypeUtil.create( 'Test' ),
			overridableData: null,
			isComponent: true,
			expect: {
				isShowingIndicator: true,
				isChecked: false,
				groupId: null,
			},
		},
		{
			should: 'be a check icon if prop is overridable',
			bind: 'title',
			currentValue: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDABLE_KEY,
				origin_value: { $$type: 'string', value: 'Test' },
			} ),
			overridableData: {
				label: 'Test Label',
				groupId: 'default',
			},
			isComponent: true,
			expect: {
				isShowingIndicator: true,
				isChecked: true,
				label: 'Test Label',
				groupId: 'default',
			},
		},
		{
			should: 'not show indicator on fields bound to forbidden keys',
			bind: '_cssid',
			isPrevented: true,
			currentValue: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDABLE_KEY,
				origin_value: { $$type: 'string', value: 'Test' },
			} ),
			overridableData: {
				label: 'Test',
				groupId: 'default',
			},
			isComponent: true,
			expect: {
				isShowingIndicator: false,
				isChecked: false,
			},
		},
	] )(
		'should $should',
		( {
			bind,
			isPrevented,
			overridableData,
			currentValue,
			isComponent,
			expect: { isShowingIndicator, isChecked, label: expectedLabel, groupId: expectedGroupId },
		} ) => {
			// Arrange
			const boundProp = mockBoundProp( {
				bind,
				value: currentValue,
				isPrevented,
			} );

			const isOverridable = componentOverridablePropTypeUtil.isValid( boundProp.value );

			const componentData: PublishedComponent = {
				id: MOCK_COMPONENT_ID,
				uid: `component-${ MOCK_COMPONENT_ID }`,
				name: 'Test Component',
				overridableProps: overridableData
					? {
							props: {
								[ MOCK_OVERRIDABLE_KEY ]: {
									overrideKey: MOCK_OVERRIDABLE_KEY,
									elementId: MOCK_ELEMENT_ID,
									propKey: bind,
									widgetType: MOCK_WIDGET_TYPE,
									elType: MOCK_EL_TYPE,
									originValue: currentValue,
									...overridableData,
								},
							},
							groups: {
								items: {
									default: {
										id: 'default',
										label: 'Default',
										props: [ MOCK_OVERRIDABLE_KEY ],
									},
								},
								order: [ 'default' ],
							},
					  }
					: {
							props: {},
							groups: {
								items: {},
								order: [],
							},
					  },
			};

			dispatch( slice.actions.load( [ componentData ] ) );
			dispatch( slice.actions.setCurrentComponentId( isComponent ? MOCK_COMPONENT_ID : null ) );

			jest.mocked( useBoundProp ).mockImplementation( ( propUtil ) => {
				if ( propUtil ) {
					return isOverridable
						? { ...boundProp, value: currentValue?.value }
						: mockBoundProp( { ...boundProp, value: null } );
				}

				return boundProp;
			} );

			// Act
			renderWithStore( <OverridablePropIndicator />, store );

			// Assert
			if ( ! isShowingIndicator ) {
				expect( screen.queryByLabelText( 'Overridable property' ) ).not.toBeInTheDocument();
				expect( screen.queryByLabelText( 'Make prop overridable' ) ).not.toBeInTheDocument();

				return;
			}

			const indicator = screen.getByLabelText( isChecked ? 'Overridable property' : 'Make prop overridable' );
			expect( indicator ).toBeInTheDocument();

			// Act
			fireEvent.click( indicator );

			// Assert
			expect( screen.getByText( ! isChecked ? 'Create new property' : 'Update property' ) ).toBeInTheDocument();

			const nameInput = screen.getByPlaceholderText( 'Enter value' );
			expect( nameInput ).toHaveValue( expectedLabel ?? '' );

			// Act
			const newLabel = 'Updated Label';
			fireEvent.change( nameInput, { target: { value: newLabel } } );

			expect( nameInput ).toHaveValue( newLabel );

			const button = screen.getByRole( 'button', { name: ! isChecked ? 'Create' : 'Update' } );
			fireEvent.click( button );

			// Assert
			const updatedState = getState();
			const updatedOverridableProps = selectOverridableProps( updatedState, MOCK_COMPONENT_ID );

			expect( updatedOverridableProps ).toBeDefined();

			const updatedProp = Object.values( updatedOverridableProps?.props ?? {} ).find(
				( prop ) => prop.elementId === MOCK_ELEMENT_ID && prop.propKey === bind
			);

			expect( updatedProp ).toMatchObject( {
				elementId: MOCK_ELEMENT_ID,
				label: newLabel,
				propKey: bind,
				widgetType: MOCK_WIDGET_TYPE,
				elType: MOCK_EL_TYPE,
				originValue: { $$type: 'string', value: 'Test' },
			} );

			if ( expectedGroupId ) {
				expect( updatedProp?.groupId ).toBe( expectedGroupId );
			}
		}
	);
} );

describe( 'OverridablePropIndicator with componentInstanceElement context', () => {
	const COMPONENT_INSTANCE_ELEMENT_ID = 'component-instance-element-123';
	const COMPONENT_INSTANCE_WIDGET_TYPE = 'e-component';
	const ORIGINAL_ELEMENT_ID = 'original-element-456';
	const ORIGINAL_WIDGET_TYPE = 'e-heading';

	const MOCK_COMPONENT_INSTANCE_ELEMENT = {
		element: { id: COMPONENT_INSTANCE_ELEMENT_ID, type: COMPONENT_INSTANCE_WIDGET_TYPE },
		elementType: {
			key: COMPONENT_INSTANCE_WIDGET_TYPE,
			propsSchema: {},
			controls: [],
			title: 'Component Instance',
		},
	};

	let store: Store< ComponentsSlice >;

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();

		jest.mocked( useElement ).mockReturnValue( {
			element: { id: ORIGINAL_ELEMENT_ID, type: ORIGINAL_WIDGET_TYPE },
			elementType: { key: ORIGINAL_WIDGET_TYPE, propsSchema: {}, controls: [], title: 'Heading' },
		} );

		jest.mocked( getWidgetsCache ).mockReturnValue( {
			[ COMPONENT_INSTANCE_WIDGET_TYPE ]: { elType: 'widget', widgetType: COMPONENT_INSTANCE_WIDGET_TYPE },
			[ ORIGINAL_WIDGET_TYPE ]: { elType: 'widget', widgetType: ORIGINAL_WIDGET_TYPE },
		} as unknown as ReturnType< typeof getWidgetsCache > );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should use componentInstanceElement.element.id as elementId when context is provided', () => {
		// Arrange
		const currentValue = stringPropTypeUtil.create( 'Test Value' );
		const bind = 'title';

		const componentData: PublishedComponent = {
			id: MOCK_COMPONENT_ID,
			uid: `component-${ MOCK_COMPONENT_ID }`,
			name: 'Test Component',
			overridableProps: {
				props: {},
				groups: { items: {}, order: [] },
			},
		};

		dispatch( slice.actions.load( [ componentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

		const boundProp = mockBoundProp( { bind, value: currentValue } );

		jest.mocked( useBoundProp ).mockImplementation( ( propUtil ) => {
			if ( propUtil ) {
				return mockBoundProp( { bind, value: null } );
			}
			return boundProp;
		} );

		// Act
		renderWithStore(
			<OverridablePropProvider componentInstanceElement={ MOCK_COMPONENT_INSTANCE_ELEMENT }>
				<OverridablePropIndicator />
			</OverridablePropProvider>,
			store
		);

		const indicator = screen.getByLabelText( 'Make prop overridable' );
		fireEvent.click( indicator );

		const nameInput = screen.getByPlaceholderText( 'Enter value' );
		fireEvent.change( nameInput, { target: { value: 'New Prop' } } );

		const createButton = screen.getByRole( 'button', { name: 'Create' } );
		fireEvent.click( createButton );

		// Assert
		const updatedState = getState();
		const updatedOverridableProps = selectOverridableProps( updatedState, MOCK_COMPONENT_ID );

		const createdProp = Object.values( updatedOverridableProps?.props ?? {} ).find(
			( prop ) => prop.propKey === bind
		);

		expect( createdProp ).toMatchObject( {
			elementId: COMPONENT_INSTANCE_ELEMENT_ID,
			widgetType: COMPONENT_INSTANCE_WIDGET_TYPE,
			propKey: bind,
			label: 'New Prop',
		} );
	} );

	it( 'should preserve originPropFields when updating existing overridable prop', () => {
		// Arrange
		const existingOriginPropFields = {
			propKey: 'content',
			widgetType: 'e-text',
			elType: 'widget',
			elementId: 'nested-text-element',
		};

		const currentValue = componentOverridablePropTypeUtil.create( {
			override_key: MOCK_OVERRIDABLE_KEY,
			origin_value: { $$type: 'string', value: 'Existing Value' },
		} );
		const bind = 'title';

		const INNER_COMPONENT_ID = 789;
		const INNER_OVERRIDE_KEY = 'inner-override-key';

		// Inner component that the nested element belongs to
		const innerComponentData: PublishedComponent = {
			id: INNER_COMPONENT_ID,
			uid: `component-${ INNER_COMPONENT_ID }`,
			name: 'Inner Component',
			overridableProps: {
				props: {
					[ INNER_OVERRIDE_KEY ]: {
						overrideKey: INNER_OVERRIDE_KEY,
						elementId: existingOriginPropFields.elementId,
						propKey: existingOriginPropFields.propKey,
						widgetType: existingOriginPropFields.widgetType,
						elType: existingOriginPropFields.elType,
						groupId: 'default',
						label: 'Inner Prop',
						originValue: { $$type: 'string', value: 'Inner Value' },
					},
				},
				groups: {
					items: { default: { id: 'default', label: 'Default', props: [ INNER_OVERRIDE_KEY ] } },
					order: [ 'default' ],
				},
			},
		};

		const componentData: PublishedComponent = {
			id: MOCK_COMPONENT_ID,
			uid: `component-${ MOCK_COMPONENT_ID }`,
			name: 'Test Component',
			overridableProps: {
				props: {
					[ MOCK_OVERRIDABLE_KEY ]: {
						overrideKey: MOCK_OVERRIDABLE_KEY,
						elementId: COMPONENT_INSTANCE_ELEMENT_ID,
						propKey: bind,
						widgetType: COMPONENT_INSTANCE_WIDGET_TYPE,
						elType: MOCK_EL_TYPE,
						groupId: 'default',
						label: 'Existing Label',
						originValue: { $$type: 'string', value: 'Existing Value' },
						originPropFields: existingOriginPropFields,
					},
				},
				groups: {
					items: { default: { id: 'default', label: 'Default', props: [ MOCK_OVERRIDABLE_KEY ] } },
					order: [ 'default' ],
				},
			},
		};
		dispatch( slice.actions.load( [ componentData, innerComponentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

		// we need to mock it for the new useSanitizeOverridableProps hook to retrieve the tested overridable
		const mockComponentInstanceSettings = componentInstancePropTypeUtil.create( {
			component_id: { $$type: 'number', value: INNER_COMPONENT_ID },
			overrides: componentInstanceOverridesPropTypeUtil.create( [
				componentOverridablePropTypeUtil.create( {
					override_key: MOCK_OVERRIDABLE_KEY,
					origin_value: componentInstanceOverridePropTypeUtil.create( {
						override_key: INNER_OVERRIDE_KEY,
						override_value: null,
						schema_source: { type: 'component', id: INNER_COMPONENT_ID },
					} ),
				} ),
			] ),
		} );

		jest.mocked( getElementSetting ).mockImplementation( ( elementId, key ) => {
			if ( elementId === COMPONENT_INSTANCE_ELEMENT_ID && key === 'component_instance' ) {
				return mockComponentInstanceSettings;
			}
			return null;
		} );

		jest.mocked( getContainerByOriginId ).mockImplementation( ( originId ) => {
			if ( originId === COMPONENT_INSTANCE_ELEMENT_ID ) {
				return {
					id: COMPONENT_INSTANCE_ELEMENT_ID,
					settings: {
						get: ( key: string ) => {
							if ( key === 'component_instance' ) {
								return mockComponentInstanceSettings;
							}
							return null;
						},
					},
				} as unknown as V1Element;
			}
			return null;
		} );

		const boundProp = mockBoundProp( { bind, value: currentValue } );

		jest.mocked( useBoundProp ).mockImplementation( ( propUtil ) => {
			if ( propUtil ) {
				return { ...boundProp, value: currentValue?.value };
			}
			return boundProp;
		} );

		// Act
		renderWithStore(
			<OverridablePropProvider
				value={ currentValue.value }
				componentInstanceElement={ MOCK_COMPONENT_INSTANCE_ELEMENT }
			>
				<OverridablePropIndicator />
			</OverridablePropProvider>,
			store
		);

		const indicator = screen.getByLabelText( 'Overridable property' );
		fireEvent.click( indicator );

		const nameInput = screen.getByPlaceholderText( 'Enter value' );
		fireEvent.change( nameInput, { target: { value: 'Updated Label' } } );

		const updateButton = screen.getByRole( 'button', { name: 'Update' } );
		fireEvent.click( updateButton );

		// Assert
		const updatedState = getState();
		const updatedOverridableProps = selectOverridableProps( updatedState, MOCK_COMPONENT_ID );

		const updatedProp = updatedOverridableProps?.props[ MOCK_OVERRIDABLE_KEY ];

		expect( updatedProp ).toMatchObject( {
			label: 'Updated Label',
			originPropFields: existingOriginPropFields,
		} );
	} );
} );

describe( 'OverridablePropForm duplicate validation', () => {
	let store: Store< ComponentsSlice >;

	const EXISTING_PROP_KEY = 'existing-prop-key';
	const EXISTING_PROP_LABEL = 'Existing Label';

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();

		jest.mocked( useElement ).mockReturnValue( {
			element: { id: MOCK_ELEMENT_ID, type: MOCK_WIDGET_TYPE },
			elementType: { key: MOCK_WIDGET_TYPE, propsSchema: {}, controls: [], title: 'Test Element' },
		} );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should show error when entering duplicate property name', () => {
		// Arrange
		const componentData: PublishedComponent = {
			id: MOCK_COMPONENT_ID,
			uid: `component-${ MOCK_COMPONENT_ID }`,
			name: 'Test Component',
			overridableProps: {
				props: {
					[ EXISTING_PROP_KEY ]: {
						overrideKey: EXISTING_PROP_KEY,
						elementId: 'other-element',
						propKey: 'other-prop',
						widgetType: MOCK_WIDGET_TYPE,
						elType: MOCK_EL_TYPE,
						originValue: { $$type: 'string', value: 'Test' },
						label: EXISTING_PROP_LABEL,
						groupId: 'default',
					},
				},
				groups: {
					items: {
						default: { id: 'default', label: 'Default', props: [ EXISTING_PROP_KEY ] },
					},
					order: [ 'default' ],
				},
			},
		};

		dispatch( slice.actions.load( [ componentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

		const boundProp = mockBoundProp( { bind: 'title', value: stringPropTypeUtil.create( 'Test' ) } );
		jest.mocked( useBoundProp ).mockImplementation( ( propUtil ) => {
			if ( propUtil ) {
				return { ...boundProp, value: null };
			}
			return boundProp;
		} );

		renderWithStore( <OverridablePropIndicator />, store );

		// Act
		const indicator = screen.getByLabelText( 'Make prop overridable' );
		fireEvent.click( indicator );

		const nameInput = screen.getByPlaceholderText( 'Enter value' );
		fireEvent.change( nameInput, { target: { value: EXISTING_PROP_LABEL } } );

		// Assert
		expect( screen.getByText( 'Property name already exists' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();
	} );

	it( 'should show error when property name is empty or whitespace', () => {
		// Arrange
		const componentData: PublishedComponent = {
			id: MOCK_COMPONENT_ID,
			uid: `component-${ MOCK_COMPONENT_ID }`,
			name: 'Test Component',
			overridableProps: {
				props: {},
				groups: { items: {}, order: [] },
			},
		};

		dispatch( slice.actions.load( [ componentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

		const boundProp = mockBoundProp( { bind: 'title', value: stringPropTypeUtil.create( 'Test' ) } );
		jest.mocked( useBoundProp ).mockImplementation( ( propUtil ) => {
			if ( propUtil ) {
				return { ...boundProp, value: null };
			}
			return boundProp;
		} );

		renderWithStore( <OverridablePropIndicator />, store );

		// Act
		const indicator = screen.getByLabelText( 'Make prop overridable' );
		fireEvent.click( indicator );

		const nameInput = screen.getByPlaceholderText( 'Enter value' );

		// Type a value first, then clear it
		fireEvent.change( nameInput, { target: { value: 'Some Value' } } );
		fireEvent.change( nameInput, { target: { value: '' } } );

		// Assert - empty name error
		expect( screen.getByText( 'Property name is required' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();

		// Act - try whitespace only
		fireEvent.change( nameInput, { target: { value: '   ' } } );

		// Assert - still shows error
		expect( screen.getByText( 'Property name is required' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();
	} );

	it( 'should prevent form submission with empty value when pressing Enter', () => {
		// Arrange
		const componentData: PublishedComponent = {
			id: MOCK_COMPONENT_ID,
			uid: `component-${ MOCK_COMPONENT_ID }`,
			name: 'Test Component',
			overridableProps: {
				props: {},
				groups: { items: {}, order: [] },
			},
		};

		dispatch( slice.actions.load( [ componentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

		const boundProp = mockBoundProp( { bind: 'title', value: stringPropTypeUtil.create( 'Test' ) } );
		jest.mocked( useBoundProp ).mockImplementation( ( propUtil ) => {
			if ( propUtil ) {
				return { ...boundProp, value: null };
			}
			return boundProp;
		} );

		renderWithStore( <OverridablePropIndicator />, store );

		// Act - open the form
		const indicator = screen.getByLabelText( 'Make prop overridable' );
		fireEvent.click( indicator );

		// Submit by pressing Enter on the input
		const nameInput = screen.getByPlaceholderText( 'Enter value' );
		fireEvent.keyDown( nameInput, { key: 'Enter', code: 'Enter' } );

		// Assert - error should be shown, form should still be open
		expect( screen.getByText( 'Property name is required' ) ).toBeInTheDocument();
		expect( screen.getByPlaceholderText( 'Enter value' ) ).toBeInTheDocument();
	} );

	it( 'should detect duplicate case-insensitively', () => {
		// Arrange
		const componentData: PublishedComponent = {
			id: MOCK_COMPONENT_ID,
			uid: `component-${ MOCK_COMPONENT_ID }`,
			name: 'Test Component',
			overridableProps: {
				props: {
					[ EXISTING_PROP_KEY ]: {
						overrideKey: EXISTING_PROP_KEY,
						elementId: 'other-element',
						propKey: 'other-prop',
						widgetType: MOCK_WIDGET_TYPE,
						elType: MOCK_EL_TYPE,
						originValue: { $$type: 'string', value: 'Test' },
						label: EXISTING_PROP_LABEL,
						groupId: 'default',
					},
				},
				groups: {
					items: {
						default: { id: 'default', label: 'Default', props: [ EXISTING_PROP_KEY ] },
					},
					order: [ 'default' ],
				},
			},
		};

		dispatch( slice.actions.load( [ componentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

		const boundProp = mockBoundProp( { bind: 'title', value: stringPropTypeUtil.create( 'Test' ) } );
		jest.mocked( useBoundProp ).mockImplementation( ( propUtil ) => {
			if ( propUtil ) {
				return { ...boundProp, value: null };
			}
			return boundProp;
		} );

		renderWithStore( <OverridablePropIndicator />, store );

		// Act
		const indicator = screen.getByLabelText( 'Make prop overridable' );
		fireEvent.click( indicator );

		const nameInput = screen.getByPlaceholderText( 'Enter value' );
		fireEvent.change( nameInput, { target: { value: 'EXISTING LABEL' } } );

		// Assert
		expect( screen.getByText( 'Property name already exists' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();
	} );

	it( 'should allow saving with same label when editing existing property', () => {
		// Arrange
		const currentValue = componentOverridablePropTypeUtil.create( {
			override_key: EXISTING_PROP_KEY,
			origin_value: { $$type: 'string', value: 'Test' },
		} );

		const componentData: PublishedComponent = {
			id: MOCK_COMPONENT_ID,
			uid: `component-${ MOCK_COMPONENT_ID }`,
			name: 'Test Component',
			overridableProps: {
				props: {
					[ EXISTING_PROP_KEY ]: {
						overrideKey: EXISTING_PROP_KEY,
						elementId: MOCK_ELEMENT_ID,
						propKey: 'title',
						widgetType: MOCK_WIDGET_TYPE,
						elType: MOCK_EL_TYPE,
						originValue: currentValue,
						label: EXISTING_PROP_LABEL,
						groupId: 'default',
					},
				},
				groups: {
					items: {
						default: { id: 'default', label: 'Default', props: [ EXISTING_PROP_KEY ] },
					},
					order: [ 'default' ],
				},
			},
		};

		dispatch( slice.actions.load( [ componentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

		jest.mocked( useBoundProp ).mockImplementation( ( propUtil ) => {
			if ( propUtil ) {
				return { ...mockBoundProp( { bind: 'title', value: currentValue } ), value: currentValue?.value };
			}
			return mockBoundProp( { bind: 'title', value: currentValue } );
		} );

		renderWithStore( <OverridablePropIndicator />, store );

		// Act
		const indicator = screen.getByLabelText( 'Overridable property' );
		fireEvent.click( indicator );

		// Assert
		expect( screen.queryByText( 'Property name already exists' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Update' } ) ).toBeEnabled();
	} );

	it( 'should clear error when entering unique name', () => {
		// Arrange
		const componentData: PublishedComponent = {
			id: MOCK_COMPONENT_ID,
			uid: `component-${ MOCK_COMPONENT_ID }`,
			name: 'Test Component',
			overridableProps: {
				props: {
					[ EXISTING_PROP_KEY ]: {
						overrideKey: EXISTING_PROP_KEY,
						elementId: 'other-element',
						propKey: 'other-prop',
						widgetType: MOCK_WIDGET_TYPE,
						elType: MOCK_EL_TYPE,
						originValue: { $$type: 'string', value: 'Test' },
						label: EXISTING_PROP_LABEL,
						groupId: 'default',
					},
				},
				groups: {
					items: {
						default: { id: 'default', label: 'Default', props: [ EXISTING_PROP_KEY ] },
					},
					order: [ 'default' ],
				},
			},
		};

		dispatch( slice.actions.load( [ componentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

		const boundProp = mockBoundProp( { bind: 'title', value: stringPropTypeUtil.create( 'Test' ) } );
		jest.mocked( useBoundProp ).mockImplementation( ( propUtil ) => {
			if ( propUtil ) {
				return { ...boundProp, value: null };
			}
			return boundProp;
		} );

		renderWithStore( <OverridablePropIndicator />, store );

		// Act
		const indicator = screen.getByLabelText( 'Make prop overridable' );
		fireEvent.click( indicator );

		const nameInput = screen.getByPlaceholderText( 'Enter value' );
		fireEvent.change( nameInput, { target: { value: EXISTING_PROP_LABEL } } );

		// Assert - error shown
		expect( screen.getByText( 'Property name already exists' ) ).toBeInTheDocument();

		// Act - change to unique name
		fireEvent.change( nameInput, { target: { value: 'Unique Name' } } );

		// Assert - error cleared
		expect( screen.queryByText( 'Property name already exists' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeEnabled();
	} );

	it( 'should show Default group when groups array is empty', () => {
		// Arrange
		const componentData: PublishedComponent = {
			id: MOCK_COMPONENT_ID,
			uid: `component-${ MOCK_COMPONENT_ID }`,
			name: 'Test Component',
			overridableProps: {
				props: {},
				groups: { items: {}, order: [] },
			},
		};

		dispatch( slice.actions.load( [ componentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

		const boundProp = mockBoundProp( { bind: 'title', value: stringPropTypeUtil.create( 'Test' ) } );
		jest.mocked( useBoundProp ).mockImplementation( ( propUtil ) => {
			if ( propUtil ) {
				return { ...boundProp, value: null };
			}
			return boundProp;
		} );

		renderWithStore( <OverridablePropIndicator />, store );

		// Act
		const indicator = screen.getByLabelText( 'Make prop overridable' );
		fireEvent.click( indicator );

		// Assert
		const groupSelect = screen.getByRole( 'combobox' );
		expect( groupSelect ).toHaveTextContent( 'Default' );
	} );
} );

function mockBoundProp( {
	bind,
	value,
	isPrevented = false,
}: {
	bind: string;
	value: TransformablePropValue< string, unknown > | null;
	isPrevented?: boolean;
} ): ReturnType< typeof useBoundProp > {
	const params = {
		value,
		setValue: jest.fn(),
		restoreValue: jest.fn(),
		resetValue: jest.fn(),
		bind,
		propType: createMockPropType( { kind: 'plain', meta: isPrevented ? { overridable: false } : {} } ),
		path: [ bind ],
	};

	return params;
}
