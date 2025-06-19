import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { screen } from '@testing-library/react';

import { useDirection } from '../../../../hooks/use-direction';
import { useStylesField } from '../../../../hooks/use-styles-field';
import { JustifyContentField } from '../justify-content-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-field' );
jest.mock( '../../../../hooks/use-direction' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );

describe( '<JustifyContentField />', () => {
	it( 'should switch order in RTL', () => {
		// Arrange.
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: true } );
		jest.mocked( useStylesField ).mockReturnValue( { canEdit: true, value: 'row', setValue: jest.fn } );

		// Act.
		renderField( <JustifyContentField />, {
			propTypes: { 'justify-content': createMockPropType( { kind: 'plain' } ) },
		} );

		const buttons = screen.getAllByRole( 'button' );
		const expectedValues = [ 'Start', 'Center', 'End', 'Space between', 'Space around', 'Space evenly' ];

		// Assert.
		expect( screen.getByRole( 'group' ) ).toHaveStyle( { direction: 'rtl' } );

		buttons.forEach( ( button, index ) => {
			expect( button ).toHaveAttribute( 'aria-label', expectedValues[ index ] );
		} );
	} );
} );
