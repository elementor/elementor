import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { screen } from '@testing-library/react';

import { useDirection } from '../../../../hooks/use-direction';
import { useStylesField } from '../../../../hooks/use-styles-field';
import { AlignItemsField } from '../align-items-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-field' );
jest.mock( '../../../../hooks/use-direction' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: () => [],
} ) );

jest.mock( '@elementor/editor-controls', () => {
	const actual = jest.requireActual( '@elementor/editor-controls' );
	return {
		...actual,
		useControlActions: () => ( {
			items: [],
		} ),
	};
} );

const renderAlignItemsField = () => {
	renderField( <AlignItemsField />, {
		propTypes: { 'align-items': createMockPropType( { kind: 'plain', key: 'string' } ) },
	} );
};

describe( '<AlignItemsField />', () => {
	it( 'align items should switch order in RTL', () => {
		// Arrange.
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: true } );
		jest.mocked( useStylesField ).mockReturnValue( { value: 'row', setValue: jest.fn, canEdit: true } );

		// Act.
		renderAlignItemsField();

		const buttons = screen.getAllByRole( 'button' );
		const expectedValues = [ 'Start', 'Center', 'End', 'Stretch' ];

		// Assert.
		expect( screen.getByRole( 'group' ) ).toHaveStyle( { direction: 'rtl' } );

		buttons.forEach( ( button, index ) => {
			expect( button ).toHaveAttribute( 'aria-label', expectedValues[ index ] );
		} );
	} );
} );
