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
		// Arrange & Act
		renderComponent();

		// Assert
		expect( screen.getByText( 'Cell Content' ) ).toBeInTheDocument();
	} );

	it( 'should pass correct props to TableCell when isHeader is true', () => {
		// Arrange & Act
		renderComponent( { isHeader: true } );

		// Assert
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );
		expect( props.sx ).toEqual(
			expect.objectContaining( {
				color: 'text.primary',
				fontWeight: 'bold',
				padding: '10px 16px',
			} )
		);
	} );

	it( 'should pass width prop to sx', () => {
		// Arrange & Act
		renderComponent( { width: 100 } );

		// Assert
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );
		expect( props.sx ).toEqual(
			expect.objectContaining( {
				width: 100,
			} )
		);
	} );

	it( 'should pass maxWidth prop to sx', () => {
		// Arrange & Act
		renderComponent( { maxWidth: 200 } );

		// Assert
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );
		expect( props.sx ).toEqual(
			expect.objectContaining( {
				maxWidth: 200,
			} )
		);
	} );

	it( 'should use default maxWidth when not provided', () => {
		// Arrange & Act
		renderComponent();

		// Assert
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );
		expect( props.sx ).toEqual(
			expect.objectContaining( {
				maxWidth: 150,
			} )
		);
	} );

	it( 'should pass noPadding prop correctly', () => {
		// Arrange & Act
		renderComponent( { noPadding: true } );

		// Assert
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );
		expect( props.padding ).toBe( 'none' );
	} );

	it( 'should pass alignment prop correctly', () => {
		// Arrange & Act
		renderComponent( { align: 'right' } );

		// Assert
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );
		expect( props.align ).toBe( 'right' );
	} );

	it( 'should merge custom sx props with base styles', () => {
		// Arrange
		const customSx = {
			backgroundColor: 'red',
			fontSize: '16px',
		};

		// Act
		renderComponent( { sx: customSx } );

		// Assert
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );
		expect( props.sx ).toEqual(
			expect.objectContaining( {
				...customSx,
				maxWidth: 150,
			} )
		);
	} );

	it( 'should not apply header padding when noPadding is true', () => {
		// Arrange & Act
		renderComponent( { isHeader: true, noPadding: true } );

		// Assert
		const cell = screen.getByRole( 'cell' );
		const props = JSON.parse( cell.getAttribute( 'data-testprops' ) || '{}' );
		expect( props.sx.padding ).toBeUndefined();
		expect( props.padding ).toBe( 'none' );
	} );
} );
