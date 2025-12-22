import * as React from 'react';
import { type ComponentType } from 'react';
import { createMockElementType, createMockPropType, renderControl } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { ElementProvider, useElement } from '@elementor/editor-editing-panel';
import { numberPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import {
	__createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice,
	__StoreProvider as StoreProvider,
	type Store,
} from '@elementor/store';
import { ErrorBoundary } from '@elementor/ui';
import { fireEvent, screen } from '@testing-library/react';

import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { useOverridablePropValue } from '../../../provider/overridable-prop-context';
import { type ComponentsSlice, selectOverridableProps, slice } from '../../../store/store';
import { type OverridableProp, type OverridableProps, type PublishedComponent } from '../../../types';
import { OverridablePropControl } from '../overridable-prop-control';

jest.mock( '@elementor/editor-editing-panel', () => ( {
	...jest.requireActual( '@elementor/editor-editing-panel' ),
	useElement: jest.fn(),
} ) );

const MOCK_DOCUMENT_ID = 42;

const BIND_WITH_PROP_TYPE_DEFAULT = 'with-prop-type-default';
const BIND = 'without-origin';
const BIND_NUMBER = 'number';

const MOCK_OVERRIDE_KEY = 'test-override-key';
const ELEMENT_TYPE = 'e-heading';

const mockPropType = createMockPropType( { kind: 'plain', key: 'string' } );
const mockPropTypeWithDefault = createMockPropType( {
	kind: 'plain',
	key: 'string',
	default: stringPropTypeUtil.create( 'Default PropType Text' ),
} );
const mockNumberPropType = createMockPropType( { kind: 'plain', key: 'number' } );

const mockElementType = createMockElementType( {
	key: ELEMENT_TYPE,
	title: 'Heading',
	propsSchema: {
		[ BIND ]: mockPropType,
		[ BIND_WITH_PROP_TYPE_DEFAULT ]: mockPropTypeWithDefault,
		[ BIND_NUMBER ]: mockNumberPropType,
	},
	controls: [
		{
			type: 'section',
			value: {
				label: 'Content',
				items: [
					{
						type: 'control',
						value: {
							type: 'text',
							bind: BIND,
							label: 'Title',
							props: {},
						},
					},
					{
						type: 'control',
						value: {
							type: 'number',
							bind: BIND_NUMBER,
							label: 'Number',
							props: {},
						},
					},
				],
			},
		},
		{
			type: 'control',
			value: {
				type: 'text',
				bind: BIND_WITH_PROP_TYPE_DEFAULT,
				label: 'Title with Origin',
				props: {},
			},
		},
	],
} );

describe( '<OverridablePropControl />', () => {
	let store: Store< ComponentsSlice >;

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();

		const componentData: PublishedComponent = {
			id: MOCK_DOCUMENT_ID,
			uid: `component-${ MOCK_DOCUMENT_ID }`,
			name: 'Test Component',
			overridableProps: mockOverridableProps( { props: {} } ),
		};

		dispatch( slice.actions.load( [ componentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_DOCUMENT_ID ) );

		jest.mocked( useElement ).mockReturnValue( {
			element: { id: 'test-widget-id', type: ELEMENT_TYPE },
			elementType: mockElementType,
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [
		{
			render: 'a text control with the value stored in origin_value',
			bind: BIND,
			expected: 'Origin Title',
			value: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: stringPropTypeUtil.create( 'Origin Title' ),
			} ),
		},
		{
			render: 'a text control with no content',
			bind: BIND,
			expected: '',
			value: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: stringPropTypeUtil.create( null ),
			} ),
		},
		{
			render: "a text control with the original prop type's default value, when origin_value is empty",
			bind: BIND_WITH_PROP_TYPE_DEFAULT,
			expected: 'Default PropType Text',
			value: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDE_KEY,
				// before the user sets any value to a settings field - we fallback to the default value of its corresponding propType
				origin_value: null,
			} ),
		},
		{
			render: 'a number control',
			bind: BIND_NUMBER,
			expected: 0,
			value: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: numberPropTypeUtil.create( 0 ),
			} ),
		},
	] )( 'should render $render', ( { bind, expected, value } ) => {
		// Arrange
		const props = { value, setValue: jest.fn(), bind, propType: mockPropType };

		// Act
		renderOverridableControl( store, props );

		// Assert
		if ( expected !== null ) {
			if ( bind === BIND_NUMBER ) {
				expect( screen.getByRole( 'spinbutton' ) ).toHaveValue( expected );
				return;
			}

			expect( screen.getByRole( 'textbox' ) ).toHaveValue( expected );
			return;
		}

		expect( screen.queryByRole( 'spinbutton' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'textbox' ) ).not.toBeInTheDocument();
	} );

	it( 'should throw error when value is not overridable', () => {
		// Arrange
		const mockConsoleError = jest.fn();
		window.console.error = mockConsoleError;
		const value = null;
		const setValue = jest.fn();
		const props = { value, setValue, bind: BIND, propType: mockPropType };

		// Act
		renderOverridableControl( store, props );

		// Assert
		expect( mockConsoleError ).toHaveBeenCalled();
	} );

	it( 'should update only the origin_value if override_key is set', () => {
		// Arrange
		const value = componentOverridablePropTypeUtil.create( {
			override_key: MOCK_OVERRIDE_KEY,
			origin_value: stringPropTypeUtil.create( 'Origin Title' ),
		} );
		const setValue = jest.fn();
		const props = { value, setValue, bind: BIND, propType: mockPropType };

		dispatch(
			slice.actions.setOverridableProps( {
				componentId: MOCK_DOCUMENT_ID,
				overridableProps: mockOverridableProps( {
					props: {
						[ MOCK_OVERRIDE_KEY ]: {
							overrideKey: MOCK_OVERRIDE_KEY,
						},
					},
				} ),
			} )
		);

		// Act
		renderOverridableControl( store, props );

		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: 'New Value' } } );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'overridable',
			value: {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: { $$type: 'string', value: 'New Value' },
			},
		} );

		const updatedState = getState();
		const updatedOverridableProps = selectOverridableProps( updatedState, MOCK_DOCUMENT_ID );
		const updatedProp = updatedOverridableProps?.props[ MOCK_OVERRIDE_KEY ];

		expect( updatedProp?.originValue ).toEqual( { $$type: 'string', value: 'New Value' } );
	} );

	it( 'should expose original prop value via useOverridablePropValue', () => {
		// Arrange
		const value = componentOverridablePropTypeUtil.create( {
			override_key: MOCK_OVERRIDE_KEY,
			origin_value: stringPropTypeUtil.create( 'Origin Title' ),
		} );
		const setValue = jest.fn();
		const props = { value, setValue, bind: BIND, propType: mockPropType };

		dispatch(
			slice.actions.setOverridableProps( {
				componentId: MOCK_DOCUMENT_ID,
				overridableProps: mockOverridableProps( {
					props: {
						[ MOCK_OVERRIDE_KEY ]: {
							overrideKey: MOCK_OVERRIDE_KEY,
						},
					},
				} ),
			} )
		);

		// Act
		renderOverridableControl( store, props, MockCustomControl );

		// Assert
		expect( screen.getByText( 'test-override-key' ) ).toBeInTheDocument();

		// Act
		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: 'New Value' } } );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'overridable',
			value: {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: { $$type: 'string', value: 'New Value' },
			},
		} );

		const updatedState = getState();
		const updatedOverridableProps = selectOverridableProps( updatedState, MOCK_DOCUMENT_ID );
		const updatedProp = updatedOverridableProps?.props[ MOCK_OVERRIDE_KEY ];

		expect( updatedProp?.originValue ).toEqual( { $$type: 'string', value: 'New Value' } );
	} );
} );

function mockOverridableProps( { props }: { props: Record< string, Partial< OverridableProp > > } ): OverridableProps {
	return {
		props: props as Record< string, OverridableProp >,
		groups: {
			items: {},
			order: [],
		},
	};
}

function MockTextControl() {
	const { value, setValue } = useBoundProp( stringPropTypeUtil );
	return <input type="text" value={ value ?? '' } onChange={ ( e ) => setValue( e.target.value ) } />;
}

function MockNumberControl() {
	const { value, setValue } = useBoundProp( numberPropTypeUtil );
	return <input type="number" value={ value ?? '' } onChange={ ( e ) => setValue( Number( e.target.value ) ) } />;
}

function renderOverridableControl(
	storeInstance: Store< ComponentsSlice >,
	props: Parameters< typeof renderControl >[ 1 ],
	AlternativeComponent: ComponentType | null = null
) {
	const OriginalControl = props.bind === BIND_NUMBER ? MockNumberControl : MockTextControl;

	return renderControl(
		<StoreProvider store={ storeInstance }>
			<ElementProvider element={ { id: 'test-widget-id', type: ELEMENT_TYPE } } elementType={ mockElementType }>
				<ErrorBoundary fallback={ null }>
					<OverridablePropControl OriginalControl={ AlternativeComponent ?? OriginalControl } />
				</ErrorBoundary>
			</ElementProvider>
		</StoreProvider>,
		props
	);
}

function MockCustomControl() {
	const { value, setValue } = useBoundProp( stringPropTypeUtil );
	const overridablePropValue = useOverridablePropValue();

	return (
		<div>
			<div>{ overridablePropValue?.override_key as string }</div>
			<input type="text" value={ value ?? '' } onChange={ ( e ) => setValue( e.target.value ) } />
		</div>
	);
}
