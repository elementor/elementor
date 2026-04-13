import * as React from 'react';
import { render, screen } from '@testing-library/react';

import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { colorVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../../prop-types';
import {
	BackgroundRepeaterColorIndicator,
	BackgroundRepeaterLabel,
	BoxShadowRepeaterColorIndicator,
	TransitionsSizeVariableLabel,
} from '../variables-repeater-item-slot';

jest.mock( '../ui/color-indicator', () => ( {
	ColorIndicator: ( { value }: { value?: string } ) => (
		<div role="presentation" aria-label="Color indicator" style={ { backgroundColor: value } } />
	),
} ) );

jest.mock( '../../hooks/use-prop-variables', () => ( {
	useVariable: jest.fn(),
} ) );

describe( 'Variables Repeater Item Slot Components', () => {
	const mockVariable = {
		key: 'test-variable-id',
		label: 'Test Variable',
		value: '#FF0000',
		type: 'color',
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

	beforeEach( () => {
		( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( mockVariable );
	} );

	describe( 'RepeaterLabel', () => {
		it( 'should render label indicator with variable value', () => {
			// Act.
			render( <BackgroundRepeaterLabel value={ mockValue } /> );

			// Assert.
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'test-variable-id' );
			expect( screen.getByText( 'Test Variable' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'ColorIndicator', () => {
		it( 'should render color indicator with the correct variable value', () => {
			// Act.
			render( <BackgroundRepeaterColorIndicator value={ mockValue } /> );

			// Assert.
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'test-variable-id' );
			const colorIndicator = screen.getByRole( 'presentation', { name: 'Color indicator' } );
			expect( colorIndicator ).toHaveStyle( { backgroundColor: mockVariable.value } );
		} );
	} );

	describe( 'BoxShadowRepeaterColorIndicator', () => {
		it( 'should render color indicator with the correct variable value for box shadow items', () => {
			// Arrange.
			( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( mockVariable );

			// Act.
			render( <BoxShadowRepeaterColorIndicator value={ mockShadowValue } /> );

			// Assert.
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( 'test-variable-id' );
			const colorIndicator = screen.getByRole( 'presentation', { name: 'Color indicator' } );
			expect( colorIndicator ).toHaveStyle( { backgroundColor: mockVariable.value } );
		} );
	} );

	describe( 'TransitionsSizeVariableLabel', () => {
		it( 'should render selection key and resolved size variable value when variable exists', () => {
			// Arrange.
			const RESOLVED_SIZE_DISPLAY = '300ms';
			( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( { value: RESOLVED_SIZE_DISPLAY } );

			// Act.
			render( <TransitionsSizeVariableLabel value={ transitionSelectionSizeWithVariable } /> );

			// Assert.
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( SELECTION_SIZE_VARIABLE_ID );
			expect( screen.getByText( `opacity: ${ RESOLVED_SIZE_DISPLAY }` ) ).toBeInTheDocument();
		} );

		it( 'should render only the selection key when no variable is resolved', () => {
			// Arrange.
			( usePropVariablesModule.useVariable as jest.Mock ).mockReturnValue( undefined );

			// Act.
			render( <TransitionsSizeVariableLabel value={ transitionSelectionSizeWithVariable } /> );

			// Assert.
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( SELECTION_SIZE_VARIABLE_ID );
			expect( screen.getByText( 'opacity' ) ).toBeInTheDocument();
		} );

		it( 'should render empty label and call useVariable with empty id when prop is not selection-size', () => {
			// Arrange.
			const nonSelectionSizeProp = { $$type: 'string' as const, value: 'not-a-selection-size' };

			// Act.
			render( <TransitionsSizeVariableLabel value={ nonSelectionSizeProp } /> );

			// Assert.
			expect( usePropVariablesModule.useVariable ).toHaveBeenCalledWith( '' );
			expect(
				screen.getByText( ( _text, element ) => {
					return element?.tagName.toLowerCase() === 'span' && element.textContent === '';
				} )
			).toBeInTheDocument();
		} );
	} );
} );
