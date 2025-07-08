import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { DimensionsField } from '../dimensions-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: () => [],
} ) );

const renderDimensionsField = () => {
	return renderField( <DimensionsField />, {
		propTypes: {
			'inset-block-start': createMockPropType( { kind: 'object' } ),
			'inset-block-end': createMockPropType( { kind: 'object' } ),
			'inset-inline-start': createMockPropType( { kind: 'object' } ),
			'inset-inline-end': createMockPropType( { kind: 'object' } ),
		},
	} );
};

describe( '<DimensionsField />', () => {
	it( 'should change value of each input', () => {
		// Arrange.
		const setValues = jest.fn();

		jest.mocked( useStylesFields ).mockImplementation( ( [ bind ] ) => ( {
			values: {
				[ bind ]: { $$type: 'size', value: { size: 20, unit: 'px' } },
			},
			setValues,
			canEdit: true,
		} ) );

		// Act.
		renderDimensionsField();

		// Arrange.
		const [ blockStart, inlineEnd, blockEnd, inlineStart ] = screen.getAllByRole( 'spinbutton' );

		// Assert.
		expect( blockStart ).toHaveValue( 20 );
		expect( blockEnd ).toHaveValue( 20 );
		expect( inlineStart ).toHaveValue( 20 );
		expect( inlineEnd ).toHaveValue( 20 );

		// Act.
		fireEvent.input( blockStart, { target: { value: 30 } } );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			{
				'inset-block-start': { $$type: 'size', value: { size: 30, unit: 'px' } },
			},
			{ history: { propDisplayName: 'Top' } }
		);

		// Act.
		fireEvent.input( blockEnd, { target: { value: 40 } } );

		// Assert.
		expect( setValues ).toHaveBeenNthCalledWith(
			2,
			{
				'inset-block-end': { $$type: 'size', value: { size: 40, unit: 'px' } },
			},
			{ history: { propDisplayName: 'Bottom' } }
		);

		// Act.
		fireEvent.input( inlineStart, { target: { value: 50 } } );

		// Assert.
		expect( setValues ).toHaveBeenNthCalledWith(
			3,
			{
				'inset-inline-start': { $$type: 'size', value: { size: 50, unit: 'px' } },
			},
			{ history: { propDisplayName: 'Left' } }
		);

		// Act.
		fireEvent.input( inlineEnd, { target: { value: 60 } } );

		// Assert.
		expect( setValues ).toHaveBeenNthCalledWith(
			4,
			{
				'inset-inline-end': { $$type: 'size', value: { size: 60, unit: 'px' } },
			},
			{ history: { propDisplayName: 'Right' } }
		);
	} );
} );
