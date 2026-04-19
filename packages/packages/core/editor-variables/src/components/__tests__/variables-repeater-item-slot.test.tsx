import * as React from 'react';
import { type PropValue } from '@elementor/editor-props';
import { render, screen } from '@testing-library/react';

import { colorVariablePropTypeUtil, customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../../prop-types';
import { service } from '../../service';
import {
	BackgroundRepeaterColorIndicator,
	BackgroundRepeaterLabel,
	BoxShadowRepeaterColorIndicator,
	BoxShadowRepeaterLabel,
	TransitionsSizeVariableLabel,
} from '../variables-repeater-item-slot';

jest.mock( '../ui/color-indicator', () => ( {
	ColorIndicator: ( { value }: { value?: string } ) => (
		<span role="presentation" aria-label="Color indicator">
			{ value ?? '' }
		</span>
	),
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

describe( 'Variables Repeater Item Slot Components', () => {
	const mockVariable = {
		label: 'Test Variable',
		value: '#FF0000',
		type: colorVariablePropTypeUtil.key,
	};

	const mockValue = {
		$$type: 'color',
		value: {
			color: {
				value: 'test-variable-id',
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
				value: 'test-variable-id',
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
		variablesSpy = jest.spyOn( service, 'variables' ).mockReturnValue( {
			'test-variable-id': {
				type: colorVariablePropTypeUtil.key,
				label: mockVariable.label,
				value: mockVariable.value,
			},
			[ SELECTION_SIZE_VARIABLE_ID ]: {
				type: sizeVariablePropTypeUtil.key,
				label: 'transition-size',
				value: '300ms',
			},
		} );
	} );

	afterEach( () => {
		variablesSpy.mockRestore();
	} );

	describe( 'RepeaterLabel', () => {
		it( 'should render label indicator with variable value', () => {
			// Act.
			render( <BackgroundRepeaterLabel value={ mockValue } /> );

			// Assert.
			expect( screen.getByText( 'Test Variable' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'ColorIndicator', () => {
		it( 'should render color indicator with the correct variable value', () => {
			// Act.
			render( <BackgroundRepeaterColorIndicator value={ mockValue } /> );

			// Assert.
			const colorIndicator = screen.getByRole( 'presentation', { name: 'Color indicator' } );
			expect( colorIndicator ).toHaveTextContent( mockVariable.value );
		} );
	} );

	describe( 'BoxShadowRepeaterColorIndicator', () => {
		it( 'should render color indicator with the correct variable value for box shadow items', () => {
			// Act.
			render( <BoxShadowRepeaterColorIndicator value={ mockShadowValue } /> );

			// Assert.
			const colorIndicator = screen.getByRole( 'presentation', { name: 'Color indicator' } );
			expect( colorIndicator ).toHaveTextContent( mockVariable.value );
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

	describe( 'TransitionsSizeVariableLabel', () => {
		it( 'should render selection key and resolved size variable value when variable exists', () => {
			// Act.
			render( <TransitionsSizeVariableLabel value={ transitionSelectionSizeWithVariable } /> );

			// Assert.
			expect( screen.getByText( 'opacity: 300ms' ) ).toBeInTheDocument();
		} );

		it( 'should render empty label when prop is not selection-size', () => {
			// Arrange.
			const nonSelectionSizeProp = { $$type: 'string' as const, value: 'not-a-selection-size' };

			// Act.
			render(
				<div role="region" aria-label="Transition size label test region">
					<TransitionsSizeVariableLabel value={ nonSelectionSizeProp } />
				</div>
			);

			// Assert.
			expect( screen.getByRole( 'region', { name: 'Transition size label test region' } ) ).toHaveTextContent(
				''
			);
		} );
	} );
} );
