import * as React from 'react';
import { createMockPropType, renderWithStore } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { useElement } from '@elementor/editor-editing-panel';
import { stringPropTypeUtil, type TransformablePropValue } from '@elementor/editor-props';
import {
	__createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice,
	type Store,
} from '@elementor/store';
import { fireEvent, screen } from '@testing-library/react';

import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { type ComponentsSlice, selectOverridableProps, slice } from '../../../store/store';
import { type PublishedComponent } from '../../../types';
import { OverridablePropIndicator } from '../overridable-prop-indicator';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	useBoundProp: jest.fn(),
} ) );
jest.mock( '@elementor/editor-editing-panel', () => ( {
	...jest.requireActual( '@elementor/editor-editing-panel' ),
	useElement: jest.fn(),
} ) );

const MOCK_ELEMENT_ID = 'test-element-123';
const MOCK_COMPONENT_ID = 456;
const MOCK_WIDGET_TYPE = 'e-heading';
const MOCK_EL_TYPE = 'widget';
const MOCK_OVERRIDABLE_KEY = 'mock-overridable-key';
const MOCK_PROP_TYPE = createMockPropType();

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
			overridableData,
			currentValue,
			isComponent,
			expect: { isShowingIndicator, isChecked, label: expectedLabel, groupId: expectedGroupId },
		} ) => {
			// Arrange
			const boundProp = mockBoundProp( {
				bind,
				value: currentValue,
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
									propType: MOCK_PROP_TYPE,
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
				expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

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

function mockBoundProp( {
	bind,
	value,
}: {
	bind: string;
	value: TransformablePropValue< string, unknown > | null;
} ): ReturnType< typeof useBoundProp > {
	const params = {
		value,
		setValue: jest.fn(),
		restoreValue: jest.fn(),
		resetValue: jest.fn(),
		bind,
		propType: createMockPropType( { kind: 'plain' } ),
		path: [ bind ],
	};

	return params;
}
