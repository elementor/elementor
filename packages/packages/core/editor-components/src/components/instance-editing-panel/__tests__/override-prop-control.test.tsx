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
import { componentInstancePropTypeUtil } from '../../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { slice } from '../../../store/store';
import { type OverridableProp } from '../../../types';
import { OverridePropControl } from '../override-prop-control';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	useBoundProp: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements' );

jest.mock( '../../../prop-types/component-instance-prop-type' );

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
		] )( 'should $should', ( { currentComponentId, matchingOverride, expectedOverrideStructure } ) => {
			// Arrange
			setupComponent( currentComponentId );
			const overrides = matchingOverride ? [ matchingOverride ] : [];

			// Act
			renderOverridePropControl( store, MOCK_OVERRIDABLE_PROP, overrides );

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
			renderOverridePropControl( store, MOCK_NESTED_OVERRIDABLE_PROP, [] );

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

			setupNestedComponents( {
				innerComponentId: INNER_COMPONENT_ID,
				innerElementId: INNER_ELEMENT_ID,
				innerOverrideKey: INNER_OVERRIDE_KEY,
				innerOriginValue: INNER_ORIGIN_VALUE,
			} );

			// Act
			renderOverridePropControl( store, overridableProp, [ overrideWithNullValue ] );

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

			setupNestedComponents( {
				innerComponentId: INNER_COMPONENT_ID,
				innerElementId: INNER_ELEMENT_ID,
				innerOverrideKey: INNER_OVERRIDE_KEY,
				innerOriginValue: INNER_ORIGIN_VALUE,
				middleComponentId: MIDDLE_COMPONENT_ID,
				middleElementId: MIDDLE_ELEMENT_ID,
				middleOverrideKey: MIDDLE_OVERRIDE_KEY,
				middleOriginPropFields: {
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					elementId: INNER_ELEMENT_ID,
				},
			} );

			// Act
			renderOverridePropControl( store, overridablePropWithNullOrigin, [ nestedOverridableWithNullValue ] );

			// Assert
			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveValue( 'Innermost Origin Value' );
		} );
	} );
} );

function setupNestedComponents( config: {
	innerComponentId: number;
	innerElementId: string;
	innerOverrideKey: string;
	innerOriginValue: { $$type: string; value: string };
	middleComponentId?: number;
	middleElementId?: string;
	middleOverrideKey?: string;
	middleOriginPropFields?: {
		propKey: string;
		widgetType: string;
		elType: string;
		elementId: string;
	};
} ) {
	type ComponentData = Parameters< typeof slice.actions.load >[ 0 ][ number ];

	const innerComponent: ComponentData = {
		id: config.innerComponentId,
		uid: `component-${ config.innerComponentId }`,
		name: 'Inner Component',
		overridableProps: {
			props: {
				[ config.innerOverrideKey ]: {
					overrideKey: config.innerOverrideKey,
					label: 'Title',
					elementId: config.innerElementId,
					propKey: 'title',
					widgetType: 'e-heading',
					elType: 'widget',
					groupId: 'content',
					originValue: config.innerOriginValue,
				},
			},
			groups: {
				items: { content: { id: 'content', label: 'Content', props: [ config.innerOverrideKey ] } },
				order: [ 'content' ],
			},
		},
	};

	const components: ComponentData[] = [ innerComponent ];

	if ( config.middleComponentId && config.middleOverrideKey && config.middleElementId ) {
		const middleComponent: ComponentData = {
			id: config.middleComponentId,
			uid: `component-${ config.middleComponentId }`,
			name: 'Middle Component',
			overridableProps: {
				props: {
					[ config.middleOverrideKey ]: {
						overrideKey: config.middleOverrideKey,
						label: 'Title',
						elementId: config.middleElementId,
						propKey: 'title',
						widgetType: 'e-heading',
						elType: 'widget',
						groupId: 'content',
						originValue: null,
						originPropFields: config.middleOriginPropFields,
					},
				},
				groups: {
					items: { content: { id: 'content', label: 'Content', props: [ config.middleOverrideKey ] } },
					order: [ 'content' ],
				},
			},
		};
		components.push( middleComponent );
	}

	dispatch( slice.actions.load( components ) );
}

function setupElementsMocks() {
	const widgetDefinitions: Record< string, { propKey: string; label: string; title: string } > = {
		'e-heading': { propKey: 'title', label: 'Title', title: 'Heading' },
		'e-text': { propKey: 'content', label: 'Content', title: 'Text' },
	};

	jest.mocked( getContainer ).mockImplementation( ( id ) => createMockContainer( id, [] ) );

	jest.mocked( getElementType ).mockImplementation( ( type ) => {
		const def = widgetDefinitions[ type ];
		if ( ! def ) {
			return null;
		}

		return {
			key: type,
			title: def.title,
			controls: [
				{
					type: 'control' as const,
					value: { bind: def.propKey, label: def.label, type: MOCK_CONTROL_TYPE, props: {} },
				},
			],
			propsSchema: { [ def.propKey ]: MOCK_PROP_TYPE },
			dependenciesPerTargetMapping: {},
			styleStates: [],
		};
	} );

	jest.mocked( getElementLabel ).mockReturnValue( 'Element Label' );

	const widgetsCache = Object.fromEntries(
		Object.entries( widgetDefinitions ).map( ( [ key, def ] ) => [
			key,
			{
				atomic_props_schema: { [ def.propKey ]: MOCK_PROP_TYPE },
				atomic_controls: [
					{
						type: 'control' as const,
						value: { bind: def.propKey, label: def.label, type: MOCK_CONTROL_TYPE, props: {} },
					},
				],
			},
		] )
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
	overrides: Parameters< typeof OverridePropControl >[ 0 ][ 'overrides' ]
) {
	return renderWithStore(
		<ControlActionsProvider items={ [] }>
			<ElementProvider element={ MOCK_INSTANCE_ELEMENT } elementType={ MOCK_INSTANCE_ELEMENT_TYPE }>
				<OverridePropControl overridableProp={ overridableProp } overrides={ overrides } />
			</ElementProvider>
		</ControlActionsProvider>,
		storeInstance
	);
}
