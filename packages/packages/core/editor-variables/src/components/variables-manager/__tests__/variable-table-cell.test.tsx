import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { VariableTableCell } from '../variable-table-cell';

jest.mock( '@elementor/ui', () => ( {
	...jest.requireActual( '@elementor/ui' ),
	TableCell: jest.fn( ( props ) => {
		const { children, ...rest } = props;
		return <td data-testprops={ JSON.stringify( rest ) }>{ children }</td>;
	} ),
} ) );

describe( 'VariableTableCell', () => {
	const renderComponent = ( props = {} ) => {
		return render(
			<table>
				<tbody>
					<tr>
						<VariableTableCell { ...props }>Cell Content</VariableTableCell>
					</tr>
				</tbody>
			</table>
		);
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render content correctly', () => {
		renderComponent();

		expect( screen.getByText( 'Cell Content' ) ).toBeInTheDocument();
	} );

	it( 'should pass correct props to TableCell when isHeader is true', () => {
		renderComponent( { isHeader: true } );
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );

		expect( props.sx ).toEqual( expect.objectContaining( {
			color: 'text.primary',
			fontWeight: 'bold',
			padding: '10px 16px',
		} ) );
	} );

	it( 'should pass width prop to sx', () => {
		renderComponent( { width: 100 } );
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );

		expect( props.sx ).toEqual( expect.objectContaining( {
			width: 100,
		} ) );
	} );

	it( 'should pass maxWidth prop to sx', () => {
		renderComponent( { maxWidth: 200 } );
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );

		expect( props.sx ).toEqual( expect.objectContaining( {
			maxWidth: 200,
		} ) );
	} );

	it( 'should use default maxWidth when not provided', () => {
		renderComponent();
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );

		expect( props.sx ).toEqual( expect.objectContaining( {
			maxWidth: 150,
		} ) );
	} );

	it( 'should pass noPadding prop correctly', () => {
		renderComponent( { noPadding: true } );
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );

		expect( props.padding ).toBe( 'none' );
	} );

	it( 'should pass alignment prop correctly', () => {
		renderComponent( { align: 'right' } );
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );

		expect( props.align ).toBe( 'right' );
	} );

	it( 'should merge custom sx props with base styles', () => {
		const customSx = {
			backgroundColor: 'red',
			fontSize: '16px',
		};

		renderComponent( { sx: customSx } );
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );

		expect( props.sx ).toEqual( expect.objectContaining( {
			...customSx,
			maxWidth: 150,
		} ) );
	} );

	it( 'should not apply header padding when noPadding is true', () => {
		renderComponent( { isHeader: true, noPadding: true } );
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );

		expect( props.sx.padding ).toBeUndefined();
		expect( props.padding ).toBe( 'none' );
	} );
} );