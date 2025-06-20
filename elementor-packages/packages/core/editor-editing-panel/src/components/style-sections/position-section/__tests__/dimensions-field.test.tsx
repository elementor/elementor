import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesField } from '../../../../hooks/use-styles-field';
import { DimensionsField } from '../dimensions-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-field' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );

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
		const setValue = jest.fn();

		jest.mocked( useStylesField ).mockReturnValue( {
			value: { $$type: 'size', value: { size: 20, unit: 'px' } },
			setValue,
			canEdit: true,
		} );

		// Act.
		renderDimensionsField();

		// Arrange.
		const [ blockStart, blockEnd, inlineStart, inlineEnd ] = screen.getAllByRole( 'spinbutton' );

		// Assert.
		expect( blockStart ).toHaveValue( 20 );
		expect( blockEnd ).toHaveValue( 20 );
		expect( inlineStart ).toHaveValue( 20 );
		expect( inlineEnd ).toHaveValue( 20 );

		// Act.
		fireEvent.input( blockStart, { target: { value: 30 } } );
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 30, unit: 'px' } } );

		fireEvent.input( blockEnd, { target: { value: 40 } } );
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 40, unit: 'px' } } );

		fireEvent.input( inlineStart, { target: { value: 50 } } );
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 50, unit: 'px' } } );

		fireEvent.input( inlineEnd, { target: { value: 60 } } );
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 60, unit: 'px' } } );
	} );
} );
