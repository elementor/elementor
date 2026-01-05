import * as React from 'react';
import { createMockPropType, renderWithStore } from 'test-utils';
import { ControlActionsProvider, TextControl, useBoundProp } from '@elementor/editor-controls';
import { controlsRegistry, ElementProvider } from '@elementor/editor-editing-panel';
import { getElementLabel, getElementType, getWidgetsCache, useElementSetting } from '@elementor/editor-elements';
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

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	useElementSetting: jest.fn(),
	getElementType: jest.fn(),
	getWidgetsCache: jest.fn(),
	getElementLabel: jest.fn(),
} ) );

jest.mock( '@elementor/session', () => ( {
	getSessionStorageItem: jest.fn(),
	setSessionStorageItem: jest.fn(),
} ) );

jest.mock( '../../../prop-types/component-instance-prop-type', () => ( {
	componentInstancePropTypeUtil: {
		extract: jest.fn(),
		key: 'component-instance',
	},
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

const WIDGET_DEFINITIONS = {
	'e-heading': { propKey: 'title', label: 'Title', title: 'Heading' },
	'e-text': { propKey: 'content', label: 'Content', title: 'Text' },
} as const;

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

		jest.mocked( useElementSetting ).mockReturnValue( {} );
		jest.mocked( componentInstancePropTypeUtil.extract ).mockReturnValue( {
			component_id: { $$type: 'number', value: MOCK_COMPONENT_ID },
			overrides: { $$type: 'overrides', value: [] },
		} );
		jest.mocked( getWidgetsCache ).mockReturnValue(
			createMockWidgetsCache() as unknown as ReturnType< typeof getWidgetsCache >
		);
		jest.mocked( getElementLabel ).mockReturnValue( 'Element Label' );
		jest.mocked( getElementType ).mockImplementation( ( type ) => {
			if ( type in WIDGET_DEFINITIONS ) {
				return createElementType( type as keyof typeof WIDGET_DEFINITIONS );
			}
			return null;
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

			expect( newOverrides ).toHaveLength( matchingOverride ? 1 : 1 );

			const createdOverride = newOverrides[ 0 ];
			expect( createdOverride.$$type ).toBe( expectedOverrideStructure.$$type );
			expect( createdOverride.value.override_key ).toBe( expectedOverrideStructure.value.override_key );
			expect( createdOverride.value.schema_source ).toEqual( expectedOverrideStructure.value.schema_source );

			if ( expectedOverrideStructure.$$type === 'overridable' ) {
				const innerOverride = createdOverride.value.origin_value;
				expect( innerOverride.$$type ).toBe( 'override' );
				expect( innerOverride.value.override_key ).toBe( 'prop-1' );
			}
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
} );

function createElementType( widgetType: keyof typeof WIDGET_DEFINITIONS ) {
	const def = WIDGET_DEFINITIONS[ widgetType ];
	return {
		key: widgetType,
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
}

function createMockWidgetsCache() {
	return Object.fromEntries(
		Object.entries( WIDGET_DEFINITIONS ).map( ( [ key, def ] ) => [
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
	);
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
