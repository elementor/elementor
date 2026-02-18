import * as React from 'react';
import { createMockContainer, createMockPropType, renderWithStore } from 'test-utils';
import { ControlActionsProvider, TextControl, useBoundProp } from '@elementor/editor-controls';
import { controlsRegistry, ElementProvider } from '@elementor/editor-editing-panel';
import { getContainer, getElementLabel, getElementType, getWidgetsCache } from '@elementor/editor-elements';
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
import { componentInstancePropTypeUtil } from '../../../prop-types/component-instance-prop-type';
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

jest.mock( '../../../prop-types/component-instance-prop-type' );

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

		jest.mocked( componentInstancePropTypeUtil.extract ).mockReturnValue( {
			component_id: { $$type: 'number', value: MOCK_COMPONENT_ID },
			overrides: { $$type: 'overrides', value: [] },
		} );

		setupElementsMocks();
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
		it.each( [
			{
				should: 'create simple override structure when no matchingOverride',
				currentComponentId: null,
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
				currentComponentId: MOCK_COMPONENT_ID_2,
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
				currentComponentId: MOCK_COMPONENT_ID_2,
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
		] )(
			'should $should',
			( { currentComponentId, matchingOverride, expectedOverrideStructure, currentComponentInstanceId } ) => {
				// Arrange
				setupComponent( currentComponentId );
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
			}
		);
	} );

	describe( 'inner control element context', () => {
		it( 'should use originPropFields element context when available', () => {
			// Arrange
			const MOCK_NESTED_OVERRIDABLE_PROP: OverridableProp = {
				overrideKey: 'nested-prop-1',
				label: 'Nested Title',
				elementId: 'nested-instance-1',
				propKey: 'title',
				widgetType: 'e-component',
				elType: 'widget',
				groupId: 'nested',
				originValue: { $$type: 'string', value: 'Nested Value' },
				originPropFields: {
					propKey: 'content',
					widgetType: 'e-text',
					elType: 'widget',
					elementId: 'original-text-element',
				},
			};

			setupComponent( MOCK_COMPONENT_ID_2 );

			// Act
			renderOverridePropControl( store, MOCK_NESTED_OVERRIDABLE_PROP, [], MOCK_COMPONENT_ID );

			// Assert
			expect( screen.getByText( 'Nested Title' ) ).toBeInTheDocument();
			expect( getElementType ).toHaveBeenCalledWith( 'e-text' );
		} );
	} );

	describe( 'recursive origin value resolution', () => {
		const INNER_COMPONENT_ID = 1001;
		const MIDDLE_COMPONENT_ID = 1002;

		const INNER_ELEMENT_ID = 'inner-element-1';
		const MIDDLE_ELEMENT_ID = 'middle-element-1';

		const INNER_OVERRIDE_KEY = 'inner-prop-key';
		const MIDDLE_OVERRIDE_KEY = 'middle-prop-key';
		const OUTER_OVERRIDE_KEY = 'outer-prop-key';

		const INNER_ORIGIN_VALUE = { $$type: 'string', value: 'Innermost Origin Value' };

		it( 'should show originValue when override is cleared (single level)', () => {
			// Arrange
			const overridableProp: OverridableProp = {
				overrideKey: INNER_OVERRIDE_KEY,
				label: 'Title',
				elementId: INNER_ELEMENT_ID,
				propKey: 'title',
				widgetType: 'e-heading',
				elType: 'widget',
				groupId: 'content',
				originValue: INNER_ORIGIN_VALUE,
			};

			const overrideWithNullValue = componentInstanceOverridePropTypeUtil.create( {
				override_key: INNER_OVERRIDE_KEY,
				override_value: null,
				schema_source: { type: 'component', id: INNER_COMPONENT_ID },
			} );

			setupNestedComponents( [
				{
					componentId: INNER_COMPONENT_ID,
					elementId: INNER_ELEMENT_ID,
					props: [
						{
							overrideKey: INNER_OVERRIDE_KEY,
							propKey: 'title',
							label: 'Title',
							originValue: INNER_ORIGIN_VALUE,
						},
					],
				},
			] );

			// Act
			renderOverridePropControl( store, overridableProp, [ overrideWithNullValue ], INNER_COMPONENT_ID );

			// Assert
			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveValue( 'Innermost Origin Value' );
		} );

		it( 'should recursively find origin value through nested overridable structure', () => {
			// Arrange
			const overridablePropWithNullOrigin: OverridableProp = {
				overrideKey: MIDDLE_OVERRIDE_KEY,
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
					override_key: MIDDLE_OVERRIDE_KEY,
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
							overrideKey: INNER_OVERRIDE_KEY,
							propKey: 'title',
							label: 'Title',
							originValue: INNER_ORIGIN_VALUE,
						},
					],
				},
				{
					componentId: MIDDLE_COMPONENT_ID,
					elementId: MIDDLE_ELEMENT_ID,
					props: [
						{
							overrideKey: MIDDLE_OVERRIDE_KEY,
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
			expect( input ).toHaveValue( 'Innermost Origin Value' );
		} );

		it( 'should resolve correct origin when multiple props share the same elementId', () => {
			// Arrange
			const LINK_OVERRIDE_KEY = 'link-prop-key';
			const LINK_ORIGIN_VALUE = { $$type: 'string', value: 'Link Origin Value' };

			const linkOverridableProp: OverridableProp = {
				overrideKey: LINK_OVERRIDE_KEY,
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
				override_key: LINK_OVERRIDE_KEY,
				origin_value: componentInstanceOverridePropTypeUtil.create( {
					override_key: LINK_OVERRIDE_KEY,
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
							overrideKey: INNER_OVERRIDE_KEY,
							propKey: 'title',
							label: 'Title',
							originValue: INNER_ORIGIN_VALUE,
						},
						{
							overrideKey: LINK_OVERRIDE_KEY,
							propKey: 'link',
							label: 'Link',
							originValue: LINK_ORIGIN_VALUE,
						},
					],
				},
				{
					componentId: MIDDLE_COMPONENT_ID,
					elementId: MIDDLE_ELEMENT_ID,
					props: [
						{
							overrideKey: INNER_OVERRIDE_KEY,
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
							overrideKey: LINK_OVERRIDE_KEY,
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

			// Act
			renderOverridePropControl( store, linkOverridableProp, [ linkOverrideWithNullValue ], MIDDLE_COMPONENT_ID );

			// Assert
			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveValue( 'Link Origin Value' );
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

function setupElementsMocks() {
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

	jest.mocked( getContainer ).mockImplementation( ( id ) => createMockContainer( id, [] ) );
	jest.mocked( getContainerByOriginId ).mockImplementation( ( originId ) => createMockContainer( originId, [] ) );

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

function setupComponent( currentComponentId: number | null ) {
	const componentData = {
		id: MOCK_COMPONENT_ID,
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
					originValue: { $$type: 'string', value: 'Original' },
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

	if ( currentComponentId ) {
		dispatch( slice.actions.setCurrentComponentId( currentComponentId ) );
	}
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
				<ElementProvider element={ MOCK_INSTANCE_ELEMENT } elementType={ MOCK_INSTANCE_ELEMENT_TYPE }>
					<OverridePropControl overrideKey={ overrideKey } />
				</ElementProvider>
			</ControlActionsProvider>
		</ComponentInstanceProvider>,
		storeInstance
	);
}
