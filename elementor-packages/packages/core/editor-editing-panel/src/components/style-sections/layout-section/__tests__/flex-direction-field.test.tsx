import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { screen } from '@testing-library/react';

import { useDirection } from '../../../../hooks/use-direction';
import { useStylesField } from '../../../../hooks/use-styles-field';
import { FlexDirectionField } from '../flex-direction-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-field' );
jest.mock( '../../../../hooks/use-direction' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );

const renderFlexDirectionField = () => {
	renderField( <FlexDirectionField />, {
		propTypes: { 'flex-direction': createMockPropType( { kind: 'plain', key: 'string' } ) },
	} );
};

describe( '<FlexDirectionField/>', () => {
	it( 'Flex direction items should switch direction in rtl', () => {
		// Arrange.
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: true } );
		jest.mocked( useStylesField ).mockReturnValue( { value: 'row', setValue: jest.fn, canEdit: true } );

		renderFlexDirectionField();

		const buttons = screen.getAllByRole( 'button' );
		const expectedValues = [ 'Row', 'Column', 'Reversed row', 'Reversed column' ];

		// Assert.
		expect( screen.getByRole( 'group' ) ).toHaveStyle( { direction: 'rtl' } );

		buttons.forEach( ( button, index ) => {
			expect( button ).toHaveAttribute( 'aria-label', expectedValues[ index ] );
		} );
	} );

	it( 'Flex direction items should not switch direction in ltr', () => {
		// Arrange.
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: false } );
		jest.mocked( useStylesField ).mockReturnValue( { value: 'row', setValue: jest.fn, canEdit: true } );

		renderFlexDirectionField();

		const buttons = screen.getAllByRole( 'button' );
		const expectedValues = [ 'Row', 'Column', 'Reversed row', 'Reversed column' ];

		// Assert.
		expect( screen.getByRole( 'group' ) ).toHaveStyle( { direction: 'ltr' } );

		buttons.forEach( ( button, index ) => {
			expect( button ).toHaveAttribute( 'aria-label', expectedValues[ index ] );
		} );
	} );
} );
