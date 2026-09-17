import * as React from 'react';
import {
	blurFilterPropTypeUtil,
	cssFilterFunctionPropUtil,
	dropShadowFilterPropTypeUtil,
	sizePropTypeUtil,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { type PropValue } from '@elementor/editor-props';
import { render, screen } from '@testing-library/react';

import { colorVariablePropTypeUtil, customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../../prop-types';
import { service } from '../../service';
import {
	BackgroundRepeaterColorIndicator,
	BackgroundRepeaterLabel,
	BoxShadowRepeaterColorIndicator,
	BoxShadowRepeaterLabel,
	FilterDropShadowIconIndicator,
	FilterDropShadowRepeaterLabel,
	FilterSingleSizeRepeaterLabel,
	TransformRepeaterLabel,
	TransitionsSizeVariableLabel,
} from '../variables-repeater-item-slot';

jest.mock( '../ui/color-indicator', () => ( {
	ColorIndicator: ( { value }: { value?: string } ) => (
		<div role="presentation" aria-label="Color indicator" style={ { backgroundColor: value } }>
			{ value ?? '' }
		</div>
	),
} ) );

jest.mock( '../../hooks/use-prop-variables', () => ( {
	...jest.requireActual( '../../hooks/use-prop-variables' ),
	useVariable: jest.fn(),
} ) );

const plainPx = ( size: number ): PropValue =>
	( {
		$$type: 'size',
		value: { unit: 'px', size },
	} ) as PropValue;

const createShadowForLabel = ( overrides: Partial< Record< 'hOffset' | 'vOffset' | 'blur' | 'spread', PropValue > > ) =>
	( {
		$$type: 'shadow' as const,
		value: {
			position: null,
			hOffset: overrides.hOffset ?? plainPx( 0 ),
			vOffset: overrides.vOffset ?? plainPx( 0 ),
			blur: overrides.blur ?? plainPx( 0 ),
			spread: overrides.spread ?? plainPx( 0 ),
			color: {
				$$type: 'color' as const,
				value: 'rgba(0, 0, 0, 1)',
			},
		},
	} ) as PropValue;

const createMoveTransformForLabel = ( overrides: Partial< Record< 'x' | 'y' | 'z', PropValue > > ) =>
	( {
		$$type: 'transform-move' as const,
		value: {
			x: overrides.x ?? plainPx( 0 ),
			y: overrides.y ?? plainPx( 0 ),
			z: overrides.z ?? plainPx( 0 ),
		},
	} ) as PropValue;

describe( 'Variables Repeater Item Slot Components', () => {
	const COLOR_VARIABLE_ID = 'test-variable-id';
	const COLOR_VARIABLE_LABEL = 'Test Variable';
	const COLOR_VARIABLE_VALUE = '#FF0000';

	const mockValue = {
		$$type: 'color',
		value: {
			color: {
				value: COLOR_VARIABLE_ID,
			},
		},
	};

	const mockShadowValue = {
		$$type: 'shadow' as const,
		value: {
			position: null,
			hOffset: plainPx( 0 ),
			vOffset: plainPx( 0 ),
			blur: plainPx( 0 ),
			spread: plainPx( 0 ),
			color: {
				$$type: colorVariablePropTypeUtil.key,
				value: COLOR_VARIABLE_ID,
			},
		},
	};

	const SELECTION_SIZE_VARIABLE_ID = 'e-gs-transition';

	const transitionSelectionSizeWithVariable = {
		$$type: 'selection-size' as const,
		value: {
			selection: {
				$$type: 'key-value' as const,
				value: {
					key: { $$type: 'string' as const, value: 'opacity' },
					value: { $$type: 'string' as const, value: 'opacity' },
				},
			},
			size: {
				$$type: sizeVariablePropTypeUtil.key,
				value: SELECTION_SIZE_VARIABLE_ID,
			},
		},
	};

	let variablesSpy: jest.SpiedFunction< typeof service.variables >;

	beforeEach( () => {
		variablesSpy = jest.spyOn( service, 'variables' ).mockReturnValue( {} );
	} );

	afterEach( () => {
		variablesSpy.mockRestore();
	} );

	describe( 'RepeaterLabel', () => {
		it( 'should render label indicator with variable value', () => {
			// Arrange.
			variablesSpy.mockReturnValue( {
				[ COLOR_VARIABLE_ID ]: {
					type: colorVariablePropTypeUtil.key,
					label: COLOR_VARIABLE_LABEL,
					value: COLOR_VARIABLE_VALUE,
				},
			} );

			// Act.
			render( <BackgroundRepeaterLabel value={ mockValue } /> );

			// Assert.
			expect( screen.getByText( COLOR_VARIABLE_LABEL ) ).toBeInTheDocument();
		} );
	} );

	describe( 'ColorIndicator', () => {
		it( 'should render color indicator with the correct variable value', () => {
			// Arrange.
			variablesSpy.mockReturnValue( {
				[ COLOR_VARIABLE_ID ]: {
					type: colorVariablePropTypeUtil.key,
					label: COLOR_VARIABLE_LABEL,
					value: COLOR_VARIABLE_VALUE,
				},
			} );

			// Act.
			render( <BackgroundRepeaterColorIndicator value={ mockValue } /> );

			// Assert.
			const colorIndicator = screen.getByRole( 'presentation', { name: 'Color indicator' } );
			expect( colorIndicator ).toHaveStyle( { backgroundColor: COLOR_VARIABLE_VALUE } );
		} );
	} );

	describe( 'BoxShadowRepeaterColorIndicator', () => {
		it( 'should render color indicator with the correct variable value for box shadow items', () => {
			// Arrange.
			variablesSpy.mockReturnValue( {
				[ COLOR_VARIABLE_ID ]: {
					type: colorVariablePropTypeUtil.key,
					label: COLOR_VARIABLE_LABEL,
					value: COLOR_VARIABLE_VALUE,
				},
			} );

			// Act.
			render( <BoxShadowRepeaterColorIndicator value={ mockShadowValue } /> );

			// Assert.
			const colorIndicator = screen.getByRole( 'presentation', { name: 'Color indicator' } );
			expect( colorIndicator ).toHaveStyle( { backgroundColor: COLOR_VARIABLE_VALUE } );
		} );
	} );

	describe( 'BoxShadowRepeaterLabel', () => {
		it.each( [
			[ 'hOffset', 'e-box-h-sz', sizeVariablePropTypeUtil.key, '1px', 'outset: 1px 0px 0px 0px' ],
			[ 'vOffset', 'e-box-v-sz', sizeVariablePropTypeUtil.key, '2px', 'outset: 0px 2px 0px 0px' ],
			[ 'blur', 'e-box-b-sz', sizeVariablePropTypeUtil.key, '3px', 'outset: 0px 0px 3px 0px' ],
			[ 'spread', 'e-box-s-sz', sizeVariablePropTypeUtil.key, '4px', 'outset: 0px 0px 0px 4px' ],
			[ 'hOffset', 'e-box-h-cs', customSizeVariablePropTypeUtil.key, '10%', 'outset: 10% 0px 0px 0px' ],
			[ 'vOffset', 'e-box-v-cs', customSizeVariablePropTypeUtil.key, '11%', 'outset: 0px 11% 0px 0px' ],
			[ 'blur', 'e-box-b-cs', customSizeVariablePropTypeUtil.key, '12%', 'outset: 0px 0px 12% 0px' ],
			[ 'spread', 'e-box-s-cs', customSizeVariablePropTypeUtil.key, '13%', 'outset: 0px 0px 0px 13%' ],
		] as const )(
			'should render resolved %s for %s variable',
			( propKey, variableId, variableType, resolvedValue, expectedLabel ) => {
				// Arrange.
				variablesSpy.mockReturnValue( {
					[ variableId ]: {
						type: variableType,
						label: 'named-size',
						value: resolvedValue,
					},
				} );
				const shadow = createShadowForLabel( {
					[ propKey ]: { $$type: variableType, value: variableId },
				} );

				// Act.
				render( <BoxShadowRepeaterLabel value={ shadow } /> );

				// Assert.
				expect( screen.getByText( expectedLabel ) ).toBeInTheDocument();
			}
		);
	} );

	describe( 'TransformRepeaterLabel', () => {
		it.each( [
			[ 'x', 'e-mv-x-sz', sizeVariablePropTypeUtil.key, '1px', /Move:\s*1px 0px 0px/ ],
			[ 'y', 'e-mv-y-sz', sizeVariablePropTypeUtil.key, '2px', /Move:\s*0px 2px 0px/ ],
			[ 'z', 'e-mv-z-sz', sizeVariablePropTypeUtil.key, '3px', /Move:\s*0px 0px 3px/ ],
			[ 'x', 'e-mv-x-cs', customSizeVariablePropTypeUtil.key, '10%', /Move:\s*10% 0px 0px/ ],
			[ 'y', 'e-mv-y-cs', customSizeVariablePropTypeUtil.key, '11%', /Move:\s*0px 11% 0px/ ],
			[ 'z', 'e-mv-z-cs', customSizeVariablePropTypeUtil.key, '12%', /Move:\s*0px 0px 12%/ ],
		] as const )(
			'should render move label for %s using %s variable',
			( axis, variableId, variableType, resolvedValue, expectedPattern ) => {
				variablesSpy.mockReturnValue( {
					[ variableId ]: {
						type: variableType,
						label: 'named-size',
						value: resolvedValue,
					},
				} );
				const move = createMoveTransformForLabel( {
					[ axis ]: { $$type: variableType, value: variableId },
				} );

				render( <TransformRepeaterLabel value={ move } /> );

				expect( screen.getByText( expectedPattern ) ).toBeInTheDocument();
			}
		);
	} );

	describe( 'TransitionsSizeVariableLabel', () => {
		it( 'should render selection key and resolved size variable value when variable exists', () => {
			// Arrange.
			const RESOLVED_SIZE_DISPLAY = '300ms';
			variablesSpy.mockReturnValue( {
				[ SELECTION_SIZE_VARIABLE_ID ]: {
					type: sizeVariablePropTypeUtil.key,
					label: 'named',
					value: RESOLVED_SIZE_DISPLAY,
				},
			} );

			// Act.
			render( <TransitionsSizeVariableLabel value={ transitionSelectionSizeWithVariable } /> );

			// Assert.
			expect( screen.getByText( `opacity: ${ RESOLVED_SIZE_DISPLAY }` ) ).toBeInTheDocument();
		} );
	} );

	describe( 'FilterDropShadowIconIndicator', () => {
		it( 'should render color indicator from resolved global color variable on drop-shadow', () => {
			// Arrange.
			const RESOLVED_HEX = '#aabbcc';
			variablesSpy.mockReturnValue( {
				[ COLOR_VARIABLE_ID ]: {
					type: colorVariablePropTypeUtil.key,
					label: 'Main',
					value: RESOLVED_HEX,
				},
			} );

			const dropShadowFilterValue = cssFilterFunctionPropUtil.create( {
				func: stringPropTypeUtil.create( 'drop-shadow' ),
				args: dropShadowFilterPropTypeUtil.create( {
					xAxis: sizePropTypeUtil.create( { size: 0, unit: 'px' } ),
					yAxis: sizePropTypeUtil.create( { size: 0, unit: 'px' } ),
					blur: sizePropTypeUtil.create( { size: 0, unit: 'px' } ),
					color: colorVariablePropTypeUtil.create( COLOR_VARIABLE_ID ),
				} ),
			} );

			// Act.
			render( <FilterDropShadowIconIndicator value={ dropShadowFilterValue } /> );

			// Assert.
			expect( screen.getByText( RESOLVED_HEX ) ).toBeInTheDocument();
			const colorIndicator = screen.getByRole( 'presentation', { name: 'Color indicator' } );
			expect( colorIndicator ).toHaveStyle( { backgroundColor: RESOLVED_HEX } );
		} );
	} );

	describe( 'FilterDropShadowRepeaterLabel', () => {
		it( 'should render resolved global size variable values for drop-shadow axes', () => {
			// Arrange.
			const SIZE_VAR_ID = 'e-gs-ds-x';
			variablesSpy.mockReturnValue( {
				[ SIZE_VAR_ID ]: {
					type: sizeVariablePropTypeUtil.key,
					label: 'x-var',
					value: '12px',
				},
			} );

			const dropShadowFilterValue = cssFilterFunctionPropUtil.create( {
				func: stringPropTypeUtil.create( 'drop-shadow' ),
				args: dropShadowFilterPropTypeUtil.create( {
					xAxis: sizeVariablePropTypeUtil.create( SIZE_VAR_ID ),
					yAxis: sizePropTypeUtil.create( { size: 3, unit: 'px' } ),
					blur: sizePropTypeUtil.create( { size: 5, unit: 'px' } ),
					color: colorVariablePropTypeUtil.create( COLOR_VARIABLE_ID ),
				} ),
			} );

			// Act.
			render( <FilterDropShadowRepeaterLabel value={ dropShadowFilterValue } /> );

			// Assert.
			expect( screen.getByText( /Drop shadow:\s*12px 3px 5px/ ) ).toBeInTheDocument();
		} );

		it( 'should render resolved global custom size variable value for a drop-shadow axis', () => {
			// Arrange.
			const CUSTOM_VAR_ID = 'e-gcs-ds-y';
			variablesSpy.mockReturnValue( {
				[ CUSTOM_VAR_ID ]: {
					type: customSizeVariablePropTypeUtil.key,
					label: 'y-var',
					value: '2rem',
				},
			} );

			const dropShadowFilterValue = cssFilterFunctionPropUtil.create( {
				func: stringPropTypeUtil.create( 'drop-shadow' ),
				args: dropShadowFilterPropTypeUtil.create( {
					xAxis: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
					yAxis: customSizeVariablePropTypeUtil.create( CUSTOM_VAR_ID ),
					blur: sizePropTypeUtil.create( { size: 5, unit: 'px' } ),
					color: colorVariablePropTypeUtil.create( COLOR_VARIABLE_ID ),
				} ),
			} );

			// Act.
			render( <FilterDropShadowRepeaterLabel value={ dropShadowFilterValue } /> );

			// Assert.
			expect( screen.getByText( /Drop shadow:\s*1px 2rem 5px/ ) ).toBeInTheDocument();
		} );
	} );

	describe( 'FilterSingleSizeRepeaterLabel', () => {
		it( 'should render resolved global size variable for a single-size filter', () => {
			// Arrange.
			const BLUR_VAR_ID = 'e-gs-blur';
			variablesSpy.mockReturnValue( {
				[ BLUR_VAR_ID ]: {
					type: sizeVariablePropTypeUtil.key,
					label: 'blur-var',
					value: '9px',
				},
			} );

			const blurFilterValue = cssFilterFunctionPropUtil.create( {
				func: stringPropTypeUtil.create( 'blur' ),
				args: blurFilterPropTypeUtil.create( {
					size: sizeVariablePropTypeUtil.create( BLUR_VAR_ID ),
				} ),
			} );

			// Act.
			render( <FilterSingleSizeRepeaterLabel value={ blurFilterValue } /> );

			// Assert.
			expect( screen.getByText( /blur:/ ) ).toBeInTheDocument();
			expect( screen.getByText( '9px' ) ).toBeInTheDocument();
			expect( screen.queryByText( '0px' ) ).not.toBeInTheDocument();
		} );
	} );
} );
