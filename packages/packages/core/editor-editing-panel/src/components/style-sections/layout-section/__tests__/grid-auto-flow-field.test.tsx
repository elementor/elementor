import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { fireEvent, screen } from '@testing-library/react';

import { useDirection } from '../../../../hooks/use-direction';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { GridAutoFlowField } from '../grid-auto-flow-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../hooks/use-direction' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: () => [],
	useInheritedValues: () => ( {} ),
} ) );

jest.mock( '@elementor/editor-controls', () => {
	const actual = jest.requireActual( '@elementor/editor-controls' );
	return {
		...actual,
		useControlActions: () => ( {
			items: [],
		} ),
		useBoundProp: jest.fn(),
	};
} );

const renderGridAutoFlowField = () => {
	renderField( <GridAutoFlowField />, {
		propTypes: { 'grid-auto-flow': createMockPropType( { kind: 'plain', key: 'string' } ) },
	} );
};

describe( '<GridAutoFlowField />', () => {
	beforeEach( () => {
		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'grid-auto-flow',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'grid-auto-flow' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: null,
			setValue: jest.fn(),
		} );
	} );

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

	it( 'should reset grid-auto-flow when the selected direction is clicked again', () => {
		// Arrange.
		const setValues = jest.fn();

		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: false } );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-auto-flow': { $$type: 'string', value: 'row' } },
			setValues,
			canEdit: true,
		} );

		// Act.
		renderGridAutoFlowField();

		const rowButton = screen.getByLabelText( 'Row' );

		// Assert.
		expect( rowButton ).toHaveClass( 'Mui-selected' );

		// Act.
		fireEvent.click( rowButton );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			{ 'grid-auto-flow': null },
			{ history: { propDisplayName: 'Auto flow' } }
		);
	} );
} );
