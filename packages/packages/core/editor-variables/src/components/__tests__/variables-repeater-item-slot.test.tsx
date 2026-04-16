import * as React from 'react';
import {
	blurFilterPropTypeUtil,
	cssFilterFunctionPropUtil,
	dropShadowFilterPropTypeUtil,
	sizePropTypeUtil,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { render, screen } from '@testing-library/react';

import { colorVariablePropTypeUtil, customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../../prop-types';
import { service } from '../../service';
import {
	BackgroundRepeaterColorIndicator,
	BackgroundRepeaterLabel,
	BoxShadowRepeaterColorIndicator,
	FilterDropShadowIconIndicator,
	FilterDropShadowRepeaterLabel,
	FilterSingleSizeRepeaterLabel,
	TransitionsSizeVariableLabel,
} from '../variables-repeater-item-slot';

jest.mock( '../ui/color-indicator', () => ( {
	ColorIndicator: ( { value }: { value?: string } ) => (
		<div
			data-testid="repeater-color-variable-icon"
			role="presentation"
			aria-label="Color indicator"
			style={ { backgroundColor: value } }
		>
			{ value ?? '' }
		</div>
	),
} ) );

jest.mock( '../../hooks/use-prop-variables', () => ( {
	...jest.requireActual( '../../hooks/use-prop-variables' ),
	useVariable: jest.fn(),
} ) );

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
			hOffset: {
				$$type: 'size' as const,
				value: { unit: 'px' as const, size: 0 },
			},
			vOffset: {
				$$type: 'size' as const,
				value: { unit: 'px' as const, size: 0 },
			},
			blur: {
				$$type: 'size' as const,
				value: { unit: 'px' as const, size: 0 },
			},
			spread: {
				$$type: 'size' as const,
				value: { unit: 'px' as const, size: 0 },
			},
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
			variablesSpy.mockReturnValue( {
				[ COLOR_VARIABLE_ID ]: {
					type: colorVariablePropTypeUtil.key,
					label: COLOR_VARIABLE_LABEL,
					value: COLOR_VARIABLE_VALUE,
				},
			} );

			render( <BackgroundRepeaterLabel value={ mockValue } /> );

			expect( screen.getByText( COLOR_VARIABLE_LABEL ) ).toBeInTheDocument();
		} );
	} );

	describe( 'ColorIndicator', () => {
		it( 'should render color indicator with the correct variable value', () => {
			variablesSpy.mockReturnValue( {
				[ COLOR_VARIABLE_ID ]: {
					type: colorVariablePropTypeUtil.key,
					label: COLOR_VARIABLE_LABEL,
					value: COLOR_VARIABLE_VALUE,
				},
			} );

			render( <BackgroundRepeaterColorIndicator value={ mockValue } /> );

			const colorIndicator = screen.getByRole( 'presentation', { name: 'Color indicator' } );
			expect( colorIndicator ).toHaveStyle( { backgroundColor: COLOR_VARIABLE_VALUE } );
		} );
	} );

	describe( 'BoxShadowRepeaterColorIndicator', () => {
		it( 'should render color indicator with the correct variable value for box shadow items', () => {
			variablesSpy.mockReturnValue( {
				[ COLOR_VARIABLE_ID ]: {
					type: colorVariablePropTypeUtil.key,
					label: COLOR_VARIABLE_LABEL,
					value: COLOR_VARIABLE_VALUE,
				},
			} );

			render( <BoxShadowRepeaterColorIndicator value={ mockShadowValue } /> );

			const colorIndicator = screen.getByRole( 'presentation', { name: 'Color indicator' } );
			expect( colorIndicator ).toHaveStyle( { backgroundColor: COLOR_VARIABLE_VALUE } );
		} );
	} );

	describe( 'TransitionsSizeVariableLabel', () => {
		it( 'should render selection key and resolved size variable value when variable exists', () => {
			const RESOLVED_SIZE_DISPLAY = '300ms';
			variablesSpy.mockReturnValue( {
				[ SELECTION_SIZE_VARIABLE_ID ]: {
					type: sizeVariablePropTypeUtil.key,
					label: 'named',
					value: RESOLVED_SIZE_DISPLAY,
				},
			} );

			render( <TransitionsSizeVariableLabel value={ transitionSelectionSizeWithVariable } /> );

			expect( screen.getByText( `opacity: ${ RESOLVED_SIZE_DISPLAY }` ) ).toBeInTheDocument();
		} );

		it( 'should render empty label when prop is not selection-size', () => {
			const nonSelectionSizeProp = { $$type: 'string' as const, value: 'not-a-selection-size' };

			render( <TransitionsSizeVariableLabel value={ nonSelectionSizeProp } /> );

			expect(
				screen.getByText( ( _text, element ) => {
					return element?.tagName.toLowerCase() === 'span' && element.textContent === '';
				} )
			).toBeInTheDocument();
		} );
	} );

	describe( 'FilterDropShadowIconIndicator', () => {
		it( 'should render color indicator from resolved global color variable on drop-shadow', () => {
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

			render( <FilterDropShadowIconIndicator value={ dropShadowFilterValue } /> );

			expect( screen.getByText( RESOLVED_HEX ) ).toBeInTheDocument();
			const colorIndicator = screen.getByRole( 'presentation', { name: 'Color indicator' } );
			expect( colorIndicator ).toHaveStyle( { backgroundColor: RESOLVED_HEX } );
		} );
	} );

	describe( 'FilterDropShadowRepeaterLabel', () => {
		it( 'should render resolved global size variable values for drop-shadow axes', () => {
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

			render( <FilterDropShadowRepeaterLabel value={ dropShadowFilterValue } /> );

			expect( screen.getByText( /Drop shadow:\s*12px 3px 5px/ ) ).toBeInTheDocument();
		} );

		it( 'should render resolved global custom size variable value for a drop-shadow axis', () => {
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

			render( <FilterDropShadowRepeaterLabel value={ dropShadowFilterValue } /> );

			expect( screen.getByText( /Drop shadow:\s*1px 2rem 5px/ ) ).toBeInTheDocument();
		} );
	} );

	describe( 'FilterSingleSizeRepeaterLabel', () => {
		it( 'should render resolved global size variable for a single-size filter', () => {
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

			const { container } = render( <FilterSingleSizeRepeaterLabel value={ blurFilterValue } /> );

			expect( container.textContent?.replace( /\s+/g, ' ' ).trim() ).toMatch( /blur:\s*9px/ );
		} );
	} );
} );
