import * as React from 'react';
import { createMockContainer, createMockPropType, renderWithStore } from 'test-utils';
import { ControlActionsProvider, TextControl, useBoundProp } from '@elementor/editor-controls';
import { controlsRegistry, ElementProvider } from '@elementor/editor-editing-panel';
import {
	getContainer,
	getElementLabel,
	getElementSettings,
	getElementType,
	getWidgetsCache,
	type V1Element,
} from '@elementor/editor-elements';
import { linkPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';
import { fireEvent, screen } from '@testing-library/react';

import { componentInstanceOverridePropTypeUtil } from '../../../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverridesPropValue } from '../../../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { ComponentInstanceProvider } from '../../../provider/component-instance-context';
import { slice } from '../../../store/store';
import { type OverridableProp } from '../../../types';
import { getContainerByOriginId } from '../../../utils/get-container-by-origin-id';
import { OverridePropControl } from '../override-prop-control';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	useBoundProp: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements' );

jest.mock( '../../../utils/get-container-by-origin-id', () => ( {
	getContainerByOriginId: jest.fn(),
} ) );

const MOCK_COMPONENT_ID = 456;
const MOCK_COMPONENT_ID_2 = 789;
const MOCK_INSTANCE_ID = 'instance-789';
const MOCK_CONTROL_TYPE = 'test-text';
const MOCK_PROP_TYPE = createMockPropType( { kind: 'plain', key: 'string' } );

const MOCK_COMPONENT_INSTANCE_PROP_TYPE = createMockPropType( {
	kind: 'object',
	key: 'component-instance',
	shape: {
		component_id: createMockPropType( { kind: 'plain', key: 'number' } ),
		overrides: createMockPropType( { kind: 'array', key: 'overrides' } ),
	},
} );

const MOCK_INSTANCE_ELEMENT = {
	id: MOCK_INSTANCE_ID,
	type: 'component-instance',
};

const MOCK_INSTANCE_ELEMENT_TYPE = {
	key: 'component-instance',
	title: 'Component Instance',
	controls: [],
	propsSchema: {
		component_instance: MOCK_COMPONENT_INSTANCE_PROP_TYPE,
	},
	dependenciesPerTargetMapping: {},
	styleStates: [],
};

describe( '<OverridePropControl />', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeAll( () => {
		controlsRegistry.register( MOCK_CONTROL_TYPE, TextControl, 'full' );
	} );

	let mockSetInstanceValue: jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		store = __createStore();

		mockSetInstanceValue = jest.fn();

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: {
				component_id: { $$type: 'number', value: MOCK_COMPONENT_ID },
				overrides: { $$type: 'overrides', value: [] },
			},
			setValue: mockSetInstanceValue,
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			bind: 'component_instance',
			propType: MOCK_COMPONENT_INSTANCE_PROP_TYPE,
			path: [ 'component_instance' ],
		} );
	} );

	const MOCK_OVERRIDABLE_PROP: OverridableProp = {
		overrideKey: 'prop-1',
		label: 'Title',
		elementId: 'element-1',
		propKey: 'title',
		widgetType: 'e-heading',
		elType: 'widget',
		groupId: 'content',
		originValue: { $$type: 'string', value: 'Original' },
	};

	describe( 'createOverrideValue structure', () => {
		beforeEach( () => {
			setupElementsMocks();
		} );

		it.each( [
			{
				should: 'create simple override structure when no matchingOverride',
				currentComponentInstanceId: MOCK_COMPONENT_ID,
				matchingOverride: null,
				expectedOverrideStructure: {
					$$type: 'override',
					value: {
						override_key: 'prop-1',
						schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
						override_value: { $$type: 'string', value: 'New Value' },
					},
				},
			},
			{
				should: 'create simple override structure when updating existing plain override',
				currentComponentInstanceId: MOCK_COMPONENT_ID,
				matchingOverride: componentInstanceOverridePropTypeUtil.create( {
					override_key: 'prop-1',
					override_value: { $$type: 'string', value: 'Existing' },
					schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
				} ),
				expectedOverrideStructure: {
					$$type: 'override',
					value: {
						override_key: 'prop-1',
						schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
						override_value: { $$type: 'string', value: 'New Value' },
					},
				},
			},
			{
				should: 'create nested overridable structure when matchingOverride is overridable',
				currentComponentInstanceId: MOCK_COMPONENT_ID,
				matchingOverride: componentOverridablePropTypeUtil.create( {
					override_key: 'outer-key',
					origin_value: componentInstanceOverridePropTypeUtil.create( {
						override_key: 'prop-1',
						override_value: { $$type: 'string', value: 'Nested' },
						schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
					} ),
				} ),
				expectedOverrideStructure: {
					$$type: 'overridable',
					value: {
						override_key: 'outer-key',
						origin_value: {
							$$type: 'override',
							value: {
								override_key: 'prop-1',
								schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
								override_value: { $$type: 'string', value: 'New Value' },
							},
						},
					},
				},
			},
		] )( 'should $should', ( { matchingOverride, expectedOverrideStructure, currentComponentInstanceId } ) => {
			// Arrange
			const overrides = matchingOverride ? [ matchingOverride ] : [];

			// Act
			renderOverridePropControl( store, MOCK_OVERRIDABLE_PROP, overrides, currentComponentInstanceId );

			const input = screen.getByRole( 'textbox' );
			fireEvent.change( input, { target: { value: 'New Value' } } );

			// Assert
			expect( mockSetInstanceValue ).toHaveBeenCalled();
			const setValueCall = mockSetInstanceValue.mock.calls[ 0 ][ 0 ];
			const newOverrides = setValueCall.overrides.value;

			const [ createdOverride ] = newOverrides;
			expect( createdOverride.$$type ).toBe( expectedOverrideStructure.$$type );
			expect( createdOverride.value ).toEqual( expectedOverrideStructure.value );
		} );
	} );

	describe( 'inner control element context', () => {
		it( 'should use originPropFields element context when available', () => {
			// Arrange
			const MOCK_NESTED_OVERRIDABLE_PROP: OverridableProp = {
				overrideKey: 'prop-2',
				label: 'Nested Title',
				elementId: 'nested-instance-1',
				propKey: 'title',
				widgetType: 'e-component',
				elType: 'widget',
				groupId: 'nested',
				originValue: { $$type: 'string', value: 'Nested Value' },
				originPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: 'element-1',
				},
			};

			setupInnerComponent( MOCK_COMPONENT_ID_2, 'nested-instance-1', 'prop-2' );

			// Act
			renderOverridePropControl( store, MOCK_NESTED_OVERRIDABLE_PROP, [], MOCK_COMPONENT_ID );

			// Assert
			expect( screen.getByText( 'Nested Title' ) ).toBeInTheDocument();
			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveValue( '' );
			expect( input ).toHaveAttribute( 'placeholder', 'Element 1 Original Title' );
			expect( getElementType ).toHaveBeenCalledWith( 'e-heading' );
		} );
	} );

	describe( 'recursive origin value resolution', () => {
		const INNER_COMPONENT_ID = 1001;
		const MIDDLE_COMPONENT_ID = 1002;

		const INNER_ELEMENT_ID = 'inner-element-1';
		const MIDDLE_ELEMENT_ID = 'middle-element-1';

		const INNER_OVERRIDE_KEY_1 = 'inner-prop-key';
		const INNER_OVERRIDE_KEY_2 = 'inner-prop-key-2';
		const MIDDLE_OVERRIDE_KEY_1 = 'middle-prop-key';
		const MIDDLE_OVERRIDE_KEY_2 = 'middle-prop-key-2';
		const OUTER_OVERRIDE_KEY = 'outer-prop-key';

		const INNER_ORIGIN_VALUE_1 = { $$type: 'string', value: 'Innermost Origin Value' };
		const INNER_ORIGIN_VALUE_2 = { $$type: 'string', value: 'Link Origin Value' };

		const INNER_ELEMENT = createMockContainer( INNER_ELEMENT_ID, [], 'e-heading', {
			title: stringPropTypeUtil.create( 'Innermost Origin Value' ),
			link: stringPropTypeUtil.create( 'Link Origin Value' ),
		} );
		const INNER_COMPONENT_INSTANCE = createMockContainer( INNER_ELEMENT_ID, [], 'e-component', {
			component_instance: {
				$$type: 'component-instance',
				value: {
					component_id: { $$type: 'number', value: INNER_COMPONENT_ID },
					overrides: {
						$$type: 'overrides',
						value: [
							componentOverridablePropTypeUtil.create( {
								override_key: MIDDLE_OVERRIDE_KEY_1,
								origin_value: componentInstanceOverridePropTypeUtil.create( {
									override_key: INNER_OVERRIDE_KEY_1,
									override_value: null,
									schema_source: { type: 'component', id: INNER_COMPONENT_ID },
								} ),
							} ),
							componentOverridablePropTypeUtil.create( {
								override_key: MIDDLE_OVERRIDE_KEY_2,
								origin_value: componentInstanceOverridePropTypeUtil.create( {
									override_key: INNER_OVERRIDE_KEY_2,
									override_value: null,
									schema_source: { type: 'component', id: INNER_COMPONENT_ID },
								} ),
							} ),
						],
					},
				},
			},
		} );

		it( 'should show empty value with no placeholder when override exists with null value (single level)', () => {
			// Arrange
			const overridableProp: OverridableProp = {
				overrideKey: INNER_OVERRIDE_KEY_1,
				label: 'Title',
				elementId: INNER_ELEMENT_ID,
				propKey: 'title',
				widgetType: 'e-heading',
				elType: 'widget',
				groupId: 'content',
				originValue: INNER_ORIGIN_VALUE_1,
			};

			const overrideWithNullValue = componentInstanceOverridePropTypeUtil.create( {
				override_key: INNER_OVERRIDE_KEY_1,
				override_value: null,
				schema_source: { type: 'component', id: INNER_COMPONENT_ID },
			} );

			setupElementsMocks( { [ INNER_ELEMENT_ID ]: INNER_ELEMENT } );
			setupNestedComponents( [
				{
					componentId: INNER_COMPONENT_ID,
					elementId: INNER_ELEMENT_ID,
					props: [
						{
							overrideKey: INNER_OVERRIDE_KEY_1,
							propKey: 'title',
							label: 'Title',
							originValue: INNER_ORIGIN_VALUE_1,
						},
					],
				},
			] );

			// Act
			renderOverridePropControl( store, overridableProp, [ overrideWithNullValue ], INNER_COMPONENT_ID );

			// Assert
			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveValue( '' );
			expect( input ).not.toHaveAttribute( 'placeholder' );
		} );

		it( 'should show originValue as placeholder when no override exists (single level)', () => {
			// Arrange
			const overridableProp: OverridableProp = {
				overrideKey: INNER_OVERRIDE_KEY_1,
				label: 'Title',
				elementId: INNER_ELEMENT_ID,
				propKey: 'title',
				widgetType: 'e-heading',
				elType: 'widget',
				groupId: 'content',
				originValue: INNER_ORIGIN_VALUE_1,
			};

			setupElementsMocks( { [ INNER_ELEMENT_ID ]: INNER_ELEMENT } );
			setupNestedComponents( [
				{
					componentId: INNER_COMPONENT_ID,
					elementId: INNER_ELEMENT_ID,
					props: [
						{
							overrideKey: INNER_OVERRIDE_KEY_1,
							propKey: 'title',
							label: 'Title',
							originValue: INNER_ORIGIN_VALUE_1,
						},
					],
				},
			] );

			// Act
			renderOverridePropControl( store, overridableProp, [], INNER_COMPONENT_ID );

			// Assert
			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveValue( '' );
			expect( input ).toHaveAttribute( 'placeholder', 'Innermost Origin Value' );
		} );

		it( 'should show empty value with no placeholder when nested override exists with null value', () => {
			// Arrange
			const overridablePropWithNullOrigin: OverridableProp = {
				overrideKey: MIDDLE_OVERRIDE_KEY_1,
				label: 'Nested Title',
				elementId: MIDDLE_ELEMENT_ID,
				propKey: 'title',
				widgetType: 'e-heading',
				elType: 'widget',
				groupId: 'content',
				originValue: null,
				originPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: INNER_ELEMENT_ID,
				},
			};

			const nestedOverridableWithNullValue = componentOverridablePropTypeUtil.create( {
				override_key: OUTER_OVERRIDE_KEY,
				origin_value: componentInstanceOverridePropTypeUtil.create( {
					override_key: MIDDLE_OVERRIDE_KEY_1,
					override_value: null,
					schema_source: { type: 'component', id: MIDDLE_COMPONENT_ID },
				} ),
			} );

			setupElementsMocks( {
				[ INNER_ELEMENT_ID ]: INNER_ELEMENT,
				[ MIDDLE_ELEMENT_ID ]: INNER_COMPONENT_INSTANCE,
			} );
			setupNestedComponents( [
				{
					componentId: INNER_COMPONENT_ID,
					elementId: INNER_ELEMENT_ID,
					props: [
						{
							overrideKey: INNER_OVERRIDE_KEY_1,
							propKey: 'title',
							label: 'Title',
							originValue: INNER_ORIGIN_VALUE_1,
						},
					],
				},
				{
					componentId: MIDDLE_COMPONENT_ID,
					elementId: MIDDLE_ELEMENT_ID,
					props: [
						{
							overrideKey: MIDDLE_OVERRIDE_KEY_1,
							propKey: 'title',
							label: 'Title',
							originValue: null,
							originPropFields: {
								propKey: 'title',
								widgetType: 'e-heading',
								elType: 'widget',
								elementId: INNER_ELEMENT_ID,
							},
						},
					],
				},
			] );

			// Act
			renderOverridePropControl(
				store,
				overridablePropWithNullOrigin,
				[ nestedOverridableWithNullValue ],
				MIDDLE_COMPONENT_ID
			);

			// Assert
			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveValue( '' );
			expect( input ).not.toHaveAttribute( 'placeholder' );
		} );

		it( 'should recursively find origin value as placeholder when no override exists', () => {
			// Arrange
			const overridablePropWithNullOrigin: OverridableProp = {
				overrideKey: MIDDLE_OVERRIDE_KEY_1,
				label: 'Nested Title',
				elementId: MIDDLE_ELEMENT_ID,
				propKey: 'title',
				widgetType: 'e-heading',
				elType: 'widget',
				groupId: 'content',
				originValue: null,
				originPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: INNER_ELEMENT_ID,
				},
			};

			setupElementsMocks( {
				[ INNER_ELEMENT_ID ]: INNER_ELEMENT,
				[ MIDDLE_ELEMENT_ID ]: INNER_COMPONENT_INSTANCE,
			} );
			setupNestedComponents( [
				{
					componentId: INNER_COMPONENT_ID,
					elementId: INNER_ELEMENT_ID,
					props: [
						{
							overrideKey: INNER_OVERRIDE_KEY_1,
							propKey: 'title',
							label: 'Title',
							originValue: INNER_ORIGIN_VALUE_1,
						},
					],
				},
				{
					componentId: MIDDLE_COMPONENT_ID,
					elementId: MIDDLE_ELEMENT_ID,
					props: [
						{
							overrideKey: MIDDLE_OVERRIDE_KEY_1,
							propKey: 'title',
							label: 'Title',
							originValue: null,
							originPropFields: {
								propKey: 'title',
								widgetType: 'e-heading',
								elType: 'widget',
								elementId: INNER_ELEMENT_ID,
							},
						},
					],
				},
			] );

			// Act
			renderOverridePropControl( store, overridablePropWithNullOrigin, [], MIDDLE_COMPONENT_ID );

			// Assert
			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveValue( '' );
			expect( input ).toHaveAttribute( 'placeholder', 'Innermost Origin Value' );
		} );

		it( 'should show empty value with no placeholder when override exists for specific prop among multiple', () => {
			// Arrange
			const linkOverridableProp: OverridableProp = {
				overrideKey: MIDDLE_OVERRIDE_KEY_2,
				label: 'Link',
				elementId: MIDDLE_ELEMENT_ID,
				propKey: 'link',
				widgetType: 'e-heading',
				elType: 'widget',
				groupId: 'content',
				originValue: null,
				originPropFields: {
					propKey: 'link',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: INNER_ELEMENT_ID,
				},
			};

			const linkOverrideWithNullValue = componentOverridablePropTypeUtil.create( {
				override_key: OUTER_OVERRIDE_KEY,
				origin_value: componentInstanceOverridePropTypeUtil.create( {
					override_key: MIDDLE_OVERRIDE_KEY_2,
					override_value: null,
					schema_source: { type: 'component', id: MIDDLE_COMPONENT_ID },
				} ),
			} );

			setupNestedComponents( [
				{
					componentId: INNER_COMPONENT_ID,
					elementId: INNER_ELEMENT_ID,
					props: [
						{
							overrideKey: INNER_OVERRIDE_KEY_1,
							propKey: 'title',
							label: 'Title',
							originValue: INNER_ORIGIN_VALUE_1,
						},
						{
							overrideKey: INNER_OVERRIDE_KEY_2,
							propKey: 'link',
							label: 'Link',
							originValue: INNER_ORIGIN_VALUE_2,
						},
					],
				},
				{
					componentId: MIDDLE_COMPONENT_ID,
					elementId: MIDDLE_ELEMENT_ID,
					props: [
						{
							overrideKey: MIDDLE_OVERRIDE_KEY_1,
							propKey: 'title',
							label: 'Title',
							originValue: null,
							originPropFields: {
								propKey: 'title',
								widgetType: 'e-heading',
								elType: 'widget',
								elementId: INNER_ELEMENT_ID,
							},
						},
						{
							overrideKey: MIDDLE_OVERRIDE_KEY_2,
							propKey: 'link',
							label: 'Link',
							originValue: null,
							originPropFields: {
								propKey: 'link',
								widgetType: 'e-heading',
								elType: 'widget',
								elementId: INNER_ELEMENT_ID,
							},
						},
					],
				},
			] );
			setupElementsMocks( {
				[ INNER_ELEMENT_ID ]: INNER_ELEMENT,
				[ MIDDLE_ELEMENT_ID ]: INNER_COMPONENT_INSTANCE,
			} );

			// Act
			renderOverridePropControl( store, linkOverridableProp, [ linkOverrideWithNullValue ], MIDDLE_COMPONENT_ID );

			// Assert
			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveValue( '' );
			expect( input ).not.toHaveAttribute( 'placeholder' );
		} );

		it( 'should resolve correct origin as placeholder when no override exists for specific prop among multiple', () => {
			// Arrange
			const linkOverridableProp: OverridableProp = {
				overrideKey: MIDDLE_OVERRIDE_KEY_2,
				label: 'Link',
				elementId: MIDDLE_ELEMENT_ID,
				propKey: 'link',
				widgetType: 'e-heading',
				elType: 'widget',
				groupId: 'content',
				originValue: null,
				originPropFields: {
					propKey: 'link',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: INNER_ELEMENT_ID,
				},
			};

			setupNestedComponents( [
				{
					componentId: INNER_COMPONENT_ID,
					elementId: INNER_ELEMENT_ID,
					props: [
						{
							overrideKey: INNER_OVERRIDE_KEY_1,
							propKey: 'title',
							label: 'Title',
							originValue: INNER_ORIGIN_VALUE_1,
						},
						{
							overrideKey: INNER_OVERRIDE_KEY_2,
							propKey: 'link',
							label: 'Link',
							originValue: INNER_ORIGIN_VALUE_2,
						},
					],
				},
				{
					componentId: MIDDLE_COMPONENT_ID,
					elementId: MIDDLE_ELEMENT_ID,
					props: [
						{
							overrideKey: MIDDLE_OVERRIDE_KEY_1,
							propKey: 'title',
							label: 'Title',
							originValue: null,
							originPropFields: {
								propKey: 'title',
								widgetType: 'e-heading',
								elType: 'widget',
								elementId: INNER_ELEMENT_ID,
							},
						},
						{
							overrideKey: MIDDLE_OVERRIDE_KEY_2,
							propKey: 'link',
							label: 'Link',
							originValue: null,
							originPropFields: {
								propKey: 'link',
								widgetType: 'e-heading',
								elType: 'widget',
								elementId: INNER_ELEMENT_ID,
							},
						},
					],
				},
			] );
			setupElementsMocks( {
				[ INNER_ELEMENT_ID ]: INNER_ELEMENT,
				[ MIDDLE_ELEMENT_ID ]: INNER_COMPONENT_INSTANCE,
			} );

			// Act
			renderOverridePropControl( store, linkOverridableProp, [], MIDDLE_COMPONENT_ID );

			// Assert
			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveValue( '' );
			expect( input ).toHaveAttribute( 'placeholder', 'Link Origin Value' );
		} );
	} );
} );

type PropConfig = {
	overrideKey: string;
	propKey: string;
	label: string;
	originValue: { $$type: string; value: string } | null;
	originPropFields?: {
		propKey: string;
		widgetType: string;
		elType: string;
		elementId: string;
	};
};

type ComponentLayerConfig = {
	componentId: number;
	elementId: string;
	props: PropConfig[];
};

function setupNestedComponents( layers: ComponentLayerConfig[] ) {
	type ComponentData = Parameters< typeof slice.actions.load >[ 0 ][ number ];

	const components: ComponentData[] = layers.map( ( layer, index ) => {
		const propsRecord = Object.fromEntries(
			layer.props.map( ( prop ) => [
				prop.overrideKey,
				{
					overrideKey: prop.overrideKey,
					label: prop.label,
					elementId: layer.elementId,
					propKey: prop.propKey,
					widgetType: 'e-heading',
					elType: 'widget',
					groupId: 'content',
					originValue: prop.originValue,
					originPropFields: prop.originPropFields,
				},
			] )
		);

		return {
			id: layer.componentId,
			uid: `component-${ layer.componentId }`,
			name: `Component ${ index + 1 }`,
			overridableProps: {
				props: propsRecord,
				groups: {
					items: {
						content: {
							id: 'content',
							label: 'Content',
							props: layer.props.map( ( p ) => p.overrideKey ),
						},
					},
					order: [ 'content' ],
				},
			},
		};
	} );

	dispatch( slice.actions.load( components ) );
}

function setupElementsMocks( elements?: Record< string, V1Element > ) {
	const widgetDefinitions: Record< string, { props: Array< { propKey: string; label: string } >; title: string } > = {
		'e-heading': {
			title: 'Heading',
			props: [
				{ propKey: 'title', label: 'Title' },
				{ propKey: 'link', label: 'Link' },
			],
		},
		'e-text': {
			title: 'Text',
			props: [ { propKey: 'content', label: 'Content' } ],
		},
	};

	const innerElementIds = [ 'element-1', 'original-text-element' ];
	jest.mocked( getContainer ).mockImplementation( ( id ) => {
		if ( innerElementIds.includes( id ) ) {
			return createMockContainer( id, [] );
		}
		return elements?.[ id ] ?? null;
	} );
	jest.mocked( getContainerByOriginId ).mockImplementation( ( originId ) => {
		if ( innerElementIds.includes( originId ) ) {
			return createMockContainer( originId, [] );
		}
		return elements?.[ originId ] ?? null;
	} );
	jest.mocked( getElementSettings ).mockImplementation( ( id ) => {
		switch ( id ) {
			case 'element-1':
				return {
					title: stringPropTypeUtil.create( 'Element 1 Original Title' ),
					link: linkPropTypeUtil.create( { destination: 'https://example.com' } ),
				};
			case 'original-text-element':
				return {
					content: stringPropTypeUtil.create( 'Original Text Element Content' ),
				};
			default:
				if ( elements?.[ id ] ) {
					return elements[ id ].settings.toJSON();
				}
				return {};
		}
	} );

	jest.mocked( getElementType ).mockImplementation( ( type ) => {
		const def = widgetDefinitions[ type ];
		if ( ! def ) {
			return null;
		}

		const controls = def.props.map( ( prop ) => ( {
			type: 'control' as const,
			value: { bind: prop.propKey, label: prop.label, type: MOCK_CONTROL_TYPE, props: {} },
		} ) );

		const propsSchema = Object.fromEntries( def.props.map( ( prop ) => [ prop.propKey, MOCK_PROP_TYPE ] ) );

		return {
			key: type,
			title: def.title,
			controls,
			propsSchema,
			dependenciesPerTargetMapping: {},
			styleStates: [],
		};
	} );

	jest.mocked( getElementLabel ).mockReturnValue( 'Element Label' );

	const widgetsCache = Object.fromEntries(
		Object.entries( widgetDefinitions ).map( ( [ key, def ] ) => {
			const controls = def.props.map( ( prop ) => ( {
				type: 'control' as const,
				value: { bind: prop.propKey, label: prop.label, type: MOCK_CONTROL_TYPE, props: {} },
			} ) );

			const propsSchema = Object.fromEntries( def.props.map( ( prop ) => [ prop.propKey, MOCK_PROP_TYPE ] ) );

			return [
				key,
				{
					atomic_props_schema: propsSchema,
					atomic_controls: controls,
				},
			];
		} )
	) as ReturnType< typeof getWidgetsCache >;

	jest.mocked( getWidgetsCache ).mockReturnValue( widgetsCache );
}

function setupInnerComponent( componentId: number, instanceId: string, outerKey: string ) {
	const componentData = {
		id: componentId,
		uid: 'component-uid',
		name: 'Test Component',
		overridableProps: {
			props: {
				'prop-1': {
					overrideKey: 'prop-1',
					label: 'Title',
					elementId: 'element-1',
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					groupId: 'content',
					originValue: { $$type: 'string', value: 'Element 1 Original Title' },
				},
			},
			groups: {
				items: {
					content: { id: 'content', label: 'Content', props: [ 'prop-1' ] },
				},
				order: [ 'content' ],
			},
		},
	};

	dispatch( slice.actions.load( [ componentData ] ) );

	setupElementsMocks( {
		[ instanceId ]: createMockContainer( instanceId, [], 'e-component', {
			component_instance: {
				$$type: 'component-instance',
				value: {
					component_id: { $$type: 'number', value: componentId },
					overrides: {
						$$type: 'overrides',
						value: [
							componentOverridablePropTypeUtil.create( {
								override_key: outerKey,
								origin_value: componentInstanceOverridePropTypeUtil.create( {
									override_key: 'prop-1',
									override_value: null,
									schema_source: { type: 'component', id: componentId },
								} ),
							} ),
						],
					},
				},
			},
		} ),
	} );
}

function renderOverridePropControl(
	storeInstance: Store< SliceState< typeof slice > >,
	overridableProp: OverridableProp,
	overrides: ComponentInstanceOverridesPropValue,
	componentId: number
) {
	const overrideKey = 'prop-1';
	const overridableProps = {
		props: {
			[ overrideKey ]: overridableProp,
		},
		groups: {
			items: { content: { id: 'content', label: 'Content', props: [ overrideKey ] } },
			order: [ 'content' ],
		},
	};

	return renderWithStore(
		<ComponentInstanceProvider
			componentId={ componentId ?? 1 }
			overrides={ overrides }
			overridableProps={ overridableProps }
		>
			<ControlActionsProvider items={ [] }>
				<ElementProvider
					element={ MOCK_INSTANCE_ELEMENT }
					elementType={ MOCK_INSTANCE_ELEMENT_TYPE }
					settings={ {} }
				>
					<OverridePropControl overrideKey={ overrideKey } />
				</ElementProvider>
			</ControlActionsProvider>
		</ComponentInstanceProvider>,
		storeInstance
	);
}
