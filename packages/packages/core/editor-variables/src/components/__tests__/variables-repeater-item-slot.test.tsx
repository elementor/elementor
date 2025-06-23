import * as React from 'react';
import { render, screen } from '@testing-library/react';

import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { BackgroundRepeaterColorIndicator, BackgroundRepeaterLabel } from '../variables-repeater-item-slot';

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
} );
