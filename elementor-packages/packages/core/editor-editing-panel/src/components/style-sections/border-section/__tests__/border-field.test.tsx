import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { BorderField } from '../border-field';

jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );

describe( 'BorderField', () => {
	it( 'should render the field with empty state', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( { values: {}, setValues, canEdit: true } );

		// Act.
		renderField( <BorderField />, {
			propTypes: {
				'border-width': createMockPropType( { kind: 'plain' } ),
				'border-color': createMockPropType( { kind: 'plain' } ),
				'border-style': createMockPropType( { kind: 'plain' } ),
			},
		} );

		expect( screen.getByText( 'Border' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Border width' ) ).not.toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Add' } ) );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith( {
			'border-width': { $$type: 'size', value: { size: 1, unit: 'px' } },
			'border-color': { $$type: 'color', value: '#000000' },
			'border-style': { $$type: 'string', value: 'solid' },
		} );
	} );

	it( 'should render the field with added state', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'border-width': { $$type: 'size', value: { size: 1, unit: 'px' } },
				'border-color': { $$type: 'color', value: '#000000' },
				'border-style': { $$type: 'string', value: 'solid' },
			},
			setValues,
			canEdit: true,
		} );

		// Act.
		renderField( <BorderField />, {
			propTypes: {
				'border-width': createMockPropType( { kind: 'plain' } ),
				'border-color': createMockPropType( { kind: 'plain' } ),
				'border-style': createMockPropType( { kind: 'plain' } ),
			},
		} );

		expect( screen.getByText( 'Border' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Border width' ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Remove' } ) );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith( {
			'border-width': null,
			'border-color': null,
			'border-style': null,
		} );
	} );
} );
