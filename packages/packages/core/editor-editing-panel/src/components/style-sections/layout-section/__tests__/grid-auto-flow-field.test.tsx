import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { screen } from '@testing-library/react';

import { useDirection } from '../../../../hooks/use-direction';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { GridAutoFlowField } from '../grid-auto-flow-field';

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

const renderGridAutoFlowField = () => {
	renderField( <GridAutoFlowField />, {
		propTypes: { 'grid-auto-flow': createMockPropType( { kind: 'plain', key: 'string' } ) },
	} );
};

describe( '<GridAutoFlowField />', () => {
	it( 'should render Row and Column direction buttons', () => {
		// Arrange.
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: false } );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-auto-flow': { $$type: 'string', value: 'row' } },
			setValues: jest.fn,
			canEdit: true,
		} );

		// Act.
		renderGridAutoFlowField();

		// Assert.
		const buttons = screen.getAllByRole( 'button' );
		const buttonLabels = buttons.map( ( button ) => button.getAttribute( 'aria-label' ) );
		expect( buttonLabels ).toContain( 'Row' );
		expect( buttonLabels ).toContain( 'Column' );
	} );

	it( 'should render Dense toggle button', () => {
		// Arrange.
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: false } );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-auto-flow': { $$type: 'string', value: 'row' } },
			setValues: jest.fn,
			canEdit: true,
		} );

		// Act.
		renderGridAutoFlowField();

		// Assert.
		expect( screen.getByLabelText( 'Dense' ) ).toBeInTheDocument();
	} );
} );
