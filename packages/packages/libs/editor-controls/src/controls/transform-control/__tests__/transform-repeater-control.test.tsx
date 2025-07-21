import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { type TransformItemPropValue, type TransformPropValue } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { TransformRepeaterControl } from '../transform-repeater-control';

describe( 'TransformRepeaterControl', () => {
	const propType = createMockPropType( {
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
		const mockTransformValue = createMockTransformValue( [] );
		const mockSetValue = jest.fn();

		// Act.
		renderControl( <TransformRepeaterControl />, {
			value: mockTransformValue,
			propType,
			setValue: mockSetValue,
		} );

		// Click the add button
		const addButton = screen.getByRole( 'button', { name: 'Add item' } );
		fireEvent.click( addButton );

		// Assert.
		expect( mockSetValue ).toHaveBeenCalledWith( {
			$$type: 'transform',
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
		} );
	} );

	it( 'should render empty state when no transform values exist', () => {
		// Arrange.
		const mockTransformValue = createMockTransformValue( [] );

		// Act.
		renderControl( <TransformRepeaterControl />, { value: mockTransformValue, propType } );

		// Assert.
		expect( screen.getByText( 'Transform' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add item' } ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Move:' ) ).not.toBeInTheDocument();
	} );
} );

const createMockTransformValue = (
	items: TransformItemPropValue[] = [
		{
			$$type: 'transform-move',
			value: {
				x: { $$type: 'size', value: { size: 10, unit: 'px' } },
				y: { $$type: 'size', value: { size: 20, unit: 'px' } },
				z: { $$type: 'size', value: { size: 0, unit: 'px' } },
			},
		},
	]
): TransformPropValue => ( {
	$$type: 'transform',
	value: items,
} );
