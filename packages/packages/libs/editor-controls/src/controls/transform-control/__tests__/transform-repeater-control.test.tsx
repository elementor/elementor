import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import {
	type PerspectiveOriginPropValue,
	type TransformFunctionsItemPropValue,
	type TransformFunctionsPropValue,
	type TransformOriginPropValue,
	type TransformPropValue,
} from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { TransformRepeaterControl } from '../transform-repeater-control';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	useSelectedElement: jest.fn( () => ( {
		element: { id: 'test-element-id', type: 'e-flexbox' },
		elementType: { key: 'e-flexbox' },
	} ) ),
	getContainer: jest.fn( () => ( {
		id: 'test-element-id',
		model: {
			get: jest.fn( ( key: string ) => {
				if ( key === 'widgetType' ) {
					return 'e-flexbox';
				}
				if ( key === 'elType' ) {
					return 'e-flexbox';
				}
				return null;
			} ),
		},
	} ) ),
	getWidgetsCache: jest.fn( () => ( {
		'e-flexbox': {
			meta: { is_container: true },
		},
	} ) ),
} ) );

type DimensionPropValue< T extends string[] > = {
	[ K in T[ number ] ]?: {
		$$type: 'size';
		value: {
			unit: string;
			size: number;
		};
	};
};

const TRANSFORM_SETTINGS_BUTTON_NAME = 'Transform settings';

describe( 'TransformRepeaterControl', () => {
	const sizePropType = createMockPropType( {
		kind: 'object',
		shape: {
			unit: createMockPropType( { kind: 'plain' } ),
			size: createMockPropType( { kind: 'plain' } ),
		},
	} );

	const propType = createMockPropType( {
		kind: 'object',
		shape: {
			'transform-functions': createMockPropType( {
				kind: 'array',
				item_prop_type: createMockPropType( {
					kind: 'union',
					prop_types: {
						'transform-move': createMockPropType( {
							kind: 'object',
							shape: {
								x: createMockPropType( {
									kind: 'object',
									shape: {
										unit: createMockPropType( { kind: 'plain' } ),
										size: createMockPropType( { kind: 'plain' } ),
									},
								} ),
								y: createMockPropType( {
									kind: 'object',
									shape: {
										unit: createMockPropType( { kind: 'plain' } ),
										size: createMockPropType( { kind: 'plain' } ),
									},
								} ),
								z: createMockPropType( {
									kind: 'object',
									shape: {
										unit: createMockPropType( { kind: 'plain' } ),
										size: createMockPropType( { kind: 'plain' } ),
									},
								} ),
							},
						} ),
						'transform-scale': createMockPropType( {
							kind: 'object',
							shape: {
								x: createMockPropType( { kind: 'plain' } ),
								y: createMockPropType( { kind: 'plain' } ),
								z: createMockPropType( { kind: 'plain' } ),
							},
						} ),
						'transform-rotate': createMockPropType( {
							kind: 'object',
							shape: {
								x: createMockPropType( {
									kind: 'object',
									shape: {
										unit: createMockPropType( { kind: 'plain' } ),
										size: createMockPropType( { kind: 'plain' } ),
									},
								} ),
								y: createMockPropType( {
									kind: 'object',
									shape: {
										unit: createMockPropType( { kind: 'plain' } ),
										size: createMockPropType( { kind: 'plain' } ),
									},
								} ),
								z: createMockPropType( {
									kind: 'object',
									shape: {
										unit: createMockPropType( { kind: 'plain' } ),
										size: createMockPropType( { kind: 'plain' } ),
									},
								} ),
							},
						} ),
						'transform-skew': createMockPropType( {
							kind: 'object',
							shape: {
								x: createMockPropType( {
									kind: 'object',
									shape: {
										unit: createMockPropType( { kind: 'plain' } ),
										size: createMockPropType( { kind: 'plain' } ),
									},
								} ),
								y: createMockPropType( {
									kind: 'object',
									shape: {
										unit: createMockPropType( { kind: 'plain' } ),
										size: createMockPropType( { kind: 'plain' } ),
									},
								} ),
							},
						} ),
					},
				} ),
			} ),
			'transform-origin': createMockPropType( {
				kind: 'object',
				shape: {
					x: sizePropType,
					y: sizePropType,
					z: sizePropType,
				},
			} ),
			perspective: sizePropType,
			'perspective-origin': createMockPropType( {
				kind: 'object',
				shape: {
					x: sizePropType,
					y: sizePropType,
				},
			} ),
		},
	} );

	it( 'should render the transform repeater with its label', () => {
		// Arrange.
		const mockTransformValue = createMockTransformValue();

		// Act.
		renderControl( <TransformRepeaterControl />, { value: mockTransformValue, propType } );

		// Assert.
		expect( screen.getByText( 'Transform' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Move: 10px, 20px, 0px' ) ).toBeInTheDocument();
	} );

	it( 'should render the default Move tab when opening an item', () => {
		// Arrange.
		const mockTransformValue = createMockTransformValue();

		// Act.
		renderControl( <TransformRepeaterControl />, { value: mockTransformValue, propType } );

		// Open the first item
		const openButton = screen.getByRole( 'button', { name: 'Open item' } );
		fireEvent.click( openButton );

		// Assert.
		expect( screen.getByText( 'Move' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Scale' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Rotate' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Skew' ) ).toBeInTheDocument();
	} );

	it( 'should switch to Scale tab when clicked', () => {
		// Arrange.
		const mockTransformValue = createMockTransformValue();

		// Act.
		renderControl( <TransformRepeaterControl />, { value: mockTransformValue, propType } );

		// Open the first item
		const openButton = screen.getByRole( 'button', { name: 'Open item' } );
		fireEvent.click( openButton );

		// Click the Scale tab
		const scaleTab = screen.getByText( 'Scale' );
		fireEvent.click( scaleTab );

		// Assert.
		expect( screen.getByText( 'Scale X' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Scale Y' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Scale Z' ) ).toBeInTheDocument();
	} );

	it( 'should switch to Rotate tab when clicked', () => {
		// Arrange.
		const mockTransformValue = createMockTransformValue();

		// Act.
		renderControl( <TransformRepeaterControl />, { value: mockTransformValue, propType } );

		// Open the first item
		const openButton = screen.getByRole( 'button', { name: 'Open item' } );
		fireEvent.click( openButton );

		// Click the Rotate tab
		const rotateTab = screen.getByText( 'Rotate' );
		fireEvent.click( rotateTab );

		// Assert.
		expect( screen.getByText( 'Rotate X' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Rotate Y' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Rotate Z' ) ).toBeInTheDocument();
	} );

	it( 'should switch to Skew tab when clicked', () => {
		// Arrange.
		const mockTransformValue = createMockTransformValue();

		// Act.
		renderControl( <TransformRepeaterControl />, { value: mockTransformValue, propType } );

		// Open the first item
		const openButton = screen.getByRole( 'button', { name: 'Open item' } );
		fireEvent.click( openButton );

		// Click the Skew tab
		const skewTab = screen.getByText( 'Skew' );
		fireEvent.click( skewTab );

		// Assert.
		expect( screen.getByText( 'Skew X' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Skew Y' ) ).toBeInTheDocument();
	} );

	it( 'should add a new transform item when clicking the add button', () => {
		// Arrange.
		const mockTransformValue = createMockTransformValue( {
			functions: [],
			origin: null,
			perspective: null,
			perspectiveOrigin: null,
		} );
		const mockSetValue = jest.fn();

		// Act.
		renderControl( <TransformRepeaterControl />, {
			value: mockTransformValue,
			propType,
			setValue: mockSetValue,
		} );

		// Click the add button
		const addButton = screen.getByRole( 'button', { name: 'Add transform item' } );
		fireEvent.click( addButton );

		// Assert.
		expect( mockSetValue ).toHaveBeenCalledWith( {
			$$type: 'transform',
			value: {
				'transform-functions': {
					$$type: 'transform-functions',
					value: [
						{
							$$type: 'transform-move',
							value: {
								x: { $$type: 'size', value: { size: 0, unit: 'px' } },
								y: { $$type: 'size', value: { size: 0, unit: 'px' } },
								z: { $$type: 'size', value: { size: 0, unit: 'px' } },
							},
						},
					],
				},
			},
		} );
	} );

	it( 'should render empty state when no transform values exist', () => {
		// Arrange.
		const mockTransformValue = createMockTransformValue( { functions: [] } );

		// Act.
		renderControl( <TransformRepeaterControl />, { value: mockTransformValue, propType } );

		// Assert.
		expect( screen.getByText( 'Transform' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add transform item' } ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Move:' ) ).not.toBeInTheDocument();
	} );

	it( 'should render the transform base control for transform', () => {
		// Arrange.
		const mockTransformValue = createMockTransformValue();

		// Act.
		renderControl( <TransformRepeaterControl />, { value: mockTransformValue, propType } );

		const transformBaseTriggerButton = screen.getByRole( 'button', { name: TRANSFORM_SETTINGS_BUTTON_NAME } );

		// Assert.
		expect( transformBaseTriggerButton ).toBeInTheDocument();
	} );

	it( 'should render the transform base values', () => {
		// Arrange.
		const mockTransformValue = createMockTransformValue( {
			origin: {
				x: { $$type: 'size', value: { size: 10, unit: 'vw' } },
				y: { $$type: 'size', value: { size: 20, unit: 'vh' } },
				z: { $$type: 'size', value: { size: 30, unit: 'rem' } },
			},
			perspective: { unit: 'em', size: 100 },
			perspectiveOrigin: {
				x: { $$type: 'size', value: { size: 40, unit: 'px' } },
				y: { $$type: 'size', value: { size: 50, unit: '%' } },
			},
		} );

		// Act.
		renderControl( <TransformRepeaterControl />, { value: mockTransformValue, propType } );
		fireEvent.click( screen.getByRole( 'button', { name: TRANSFORM_SETTINGS_BUTTON_NAME } ) );

		const inputs = screen.getAllByDisplayValue( /\d*/ );

		// Assert.
		expect( inputs[ 0 ] ).toHaveValue( 10 );
		expect( inputs[ 1 ] ).toHaveValue( 20 );
		expect( inputs[ 2 ] ).toHaveValue( 30 );
		expect( inputs[ 3 ] ).toHaveValue( 100 );
		expect( inputs[ 4 ] ).toHaveValue( 40 );
		expect( inputs[ 5 ] ).toHaveValue( 50 );
	} );

	describe( 'should update the transform base values', () => {
		const mockTransformValue = createMockTransformValue( {
			origin: {
				x: { $$type: 'size', value: { size: 10, unit: 'vw' } },
				y: { $$type: 'size', value: { size: 20, unit: 'vh' } },
				z: { $$type: 'size', value: { size: 30, unit: 'rem' } },
			},
			perspective: { unit: 'em', size: 100 },
			perspectiveOrigin: {
				x: { $$type: 'size', value: { size: 40, unit: 'px' } },
				y: { $$type: 'size', value: { size: 50, unit: '%' } },
			},
		} );

		it.each( getTransformBaseTestCases( mockTransformValue ) )(
			'update input[$index] to $newValue',
			( { index, newValue, value } ) => {
				// Arrange.
				const setValue = jest.fn();

				// Act.
				renderControl( <TransformRepeaterControl />, { value: mockTransformValue, propType, setValue } );
				fireEvent.click( screen.getByRole( 'button', { name: TRANSFORM_SETTINGS_BUTTON_NAME } ) );

				const inputs = screen.getAllByDisplayValue( /\d*/ );

				fireEvent.input( inputs[ index ], { target: { value: newValue } } );

				// Assert.
				expect( setValue ).toHaveBeenCalledWith( {
					$$type: 'transform',
					value,
				} );
			}
		);
	} );
} );

function createMockTransformFunctionsValue( items: TransformFunctionsItemPropValue[] ): TransformFunctionsPropValue {
	return {
		$$type: 'transform-functions',
		value: items,
	};
}

function createMockTransformOriginValue( origin: DimensionPropValue< [ 'x', 'y', 'z' ] > ): TransformOriginPropValue {
	return {
		$$type: 'transform-origin',
		value: origin,
	};
}

function createMockPerspectiveValue( perspective: { unit: string; size: number } ) {
	return {
		$$type: 'size',
		value: perspective,
	};
}

function createMockPerspectiveOriginValue( origin: DimensionPropValue< [ 'x', 'y' ] > ): PerspectiveOriginPropValue {
	return {
		$$type: 'perspective-origin',
		value: origin,
	};
}

function createMockTransformValue( props?: {
	functions?: TransformFunctionsItemPropValue[] | null;
	origin?: DimensionPropValue< [ 'x', 'y', 'z' ] > | null;
	perspective?: { unit: string; size: number } | null;
	perspectiveOrigin?: DimensionPropValue< [ 'x', 'y' ] > | null;
} ): TransformPropValue {
	const functions = props?.functions ?? [
		{
			$$type: 'transform-move',
			value: {
				x: { $$type: 'size', value: { size: 10, unit: 'px' } },
				y: { $$type: 'size', value: { size: 20, unit: 'px' } },
				z: { $$type: 'size', value: { size: 0, unit: 'px' } },
			},
		},
	];

	const origin = props?.origin ?? {
		x: { $$type: 'size', value: { size: 0, unit: 'px' } },
		y: { $$type: 'size', value: { size: 0, unit: 'px' } },
		z: { $$type: 'size', value: { size: 0, unit: 'px' } },
	};

	const perspective = props?.perspective ?? { unit: 'px', size: 0 };

	const perspectiveOrigin = props?.perspectiveOrigin ?? {
		x: { $$type: 'size', value: { size: 0, unit: 'px' } },
		y: { $$type: 'size', value: { size: 0, unit: 'px' } },
	};

	return {
		$$type: 'transform',
		value: {
			'transform-functions':
				props?.functions === null ? undefined : createMockTransformFunctionsValue( functions ),
			'transform-origin': props?.origin === null ? undefined : createMockTransformOriginValue( origin ),
			perspective: props?.perspective === null ? undefined : createMockPerspectiveValue( perspective ),
			'perspective-origin':
				props?.perspectiveOrigin === null ? undefined : createMockPerspectiveOriginValue( perspectiveOrigin ),
		},
	};
}

function getTransformBaseTestCases( mockTransformValue: TransformPropValue ) {
	return [
		{
			index: 0,
			newValue: 20,
			value: {
				...mockTransformValue.value,
				'transform-origin': {
					$$type: 'transform-origin',
					value: {
						...mockTransformValue.value[ 'transform-origin' ].value,
						x: { $$type: 'size', value: { size: 20, unit: 'vw' } },
					},
				},
			},
		},
		{
			index: 1,
			newValue: 30,
			value: {
				...mockTransformValue.value,
				'transform-origin': {
					$$type: 'transform-origin',
					value: {
						...mockTransformValue.value[ 'transform-origin' ].value,
						y: { $$type: 'size', value: { size: 30, unit: 'vh' } },
					},
				},
			},
		},
		{
			index: 2,
			newValue: 40,
			value: {
				...mockTransformValue.value,
				'transform-origin': {
					$$type: 'transform-origin',
					value: {
						...mockTransformValue.value[ 'transform-origin' ].value,
						z: { $$type: 'size', value: { size: 40, unit: 'rem' } },
					},
				},
			},
		},
		{
			index: 3,
			newValue: 200,
			value: {
				...mockTransformValue.value,
				perspective: {
					$$type: 'size',
					value: {
						...mockTransformValue.value.perspective.value,
						size: 200,
					},
				},
			},
		},
		{
			index: 4,
			newValue: 60,
			value: {
				...mockTransformValue.value,
				'perspective-origin': {
					$$type: 'perspective-origin',
					value: {
						...mockTransformValue.value[ 'perspective-origin' ].value,
						x: { $$type: 'size', value: { size: 60, unit: 'px' } },
					},
				},
			},
		},
		{
			index: 5,
			newValue: 70,
			value: {
				...mockTransformValue.value,
				'perspective-origin': {
					$$type: 'perspective-origin',
					value: {
						...mockTransformValue.value[ 'perspective-origin' ].value,
						y: { $$type: 'size', value: { size: 70, unit: '%' } },
					},
				},
			},
		},
	];
}
