import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { screen } from '@testing-library/react';

import { useDirection } from '../../../../hooks/use-direction';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { GridJustifyItemsField } from '../grid-justify-items-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-fields' );
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

const renderGridJustifyItemsField = () => {
	renderField( <GridJustifyItemsField />, {
		propTypes: { 'justify-items': createMockPropType( { kind: 'plain', key: 'string' } ) },
	} );
};

describe( '<GridJustifyItemsField />', () => {
	it( 'should render Start, Center, End, Stretch buttons', () => {
		// Arrange.
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: false } );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'justify-items': null },
			setValues: jest.fn,
			canEdit: true,
		} );

		// Act.
		renderGridJustifyItemsField();

		const buttons = screen.getAllByRole( 'button' );
		const expectedValues = [ 'Start', 'Center', 'End', 'Stretch' ];

		// Assert.
		buttons.forEach( ( button, index ) => {
			expect( button ).toHaveAttribute( 'aria-label', expectedValues[ index ] );
		} );
	} );

	it( 'should switch order in RTL', () => {
		// Arrange.
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: true } );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'justify-items': null },
			setValues: jest.fn,
			canEdit: true,
		} );

		// Act.
		renderGridJustifyItemsField();

		// Assert.
		expect( screen.getByRole( 'group' ) ).toHaveStyle( { direction: 'rtl' } );
	} );
} );
