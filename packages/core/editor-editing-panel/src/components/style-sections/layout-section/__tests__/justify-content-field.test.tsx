import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { screen } from '@testing-library/react';

import { useDirection } from '../../../../hooks/use-direction';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { JustifyContentField } from '../justify-content-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../hooks/use-direction' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/style-context', () => ( {
	useStyle: () => ( { meta: null } ),
} ) );

jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: () => [],
} ) );

describe( '<JustifyContentField />', () => {
	it( 'should switch order in RTL', () => {
		// Arrange.
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: true } );
		jest.mocked( useStylesFields ).mockReturnValue( {
			canEdit: true,
			values: { 'justify-content': 'row' },
			setValues: jest.fn,
		} );

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
