import * as React from 'react';
import { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SizeComponent } from '../size-component';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( key: string ) => key,
} ) );

jest.mock( '../utils/is-extended-unit', () => ( {
	isExtendedUnit: jest.fn(),
} ) );

const isExtendedUnitMock = jest.requireMock( '../utils/is-extended-unit' ).isExtendedUnit;

const renderComponent = ( props = {} ) => {
	render(
		<SizeComponent
			value={ { size: 10, unit: 'px' } }
			units={ [ 'px', 'rem', 'custom', 'em' ] }
			onChange={ jest.fn() }
			{ ...props }
		/>
	);
};

describe( 'SizeComponent', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		isExtendedUnitMock.mockImplementation( ( unit: string ) => unit === 'custom' );
	} );

	describe( 'rendering', () => {
		it( 'should render SizeField with value and units', () => {
			// Arrange & Act.
			renderComponent();

			// Assert.
			expect( screen.getByRole( 'spinbutton' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'px' } ) ).toBeInTheDocument();
		} );

		it( 'should not render TextFieldPopover when unit is not custom', () => {
			// Arrange & Act.
			renderComponent();

			// Assert.
			expect( screen.queryByText( 'CSS function' ) ).not.toBeInTheDocument();
		} );

		it( 'should not render TextFieldPopover when anchorRef.current is null', () => {
			// Arrange.
			const anchorRef = createRef< HTMLDivElement | null >();

			// Act.
			renderComponent( { anchorRef, value: { size: 'calc(100% - 10px)', unit: 'custom' } } );

			// Assert - popover only opens when anchorRef.current is set (useEffect in component).
			expect( screen.queryByText( 'CSS function' ) ).not.toBeInTheDocument();
		} );

		it( 'should render TextFieldPopover when unit is custom and anchorRef has current and popup is open', async () => {
			// Arrange.
			const anchorRef = createRef< HTMLDivElement >() as React.MutableRefObject< HTMLDivElement >;
			anchorRef.current = document.createElement( 'div' );

			// Act.
			renderComponent( { anchorRef, value: { size: 'calc(100% - 10px)', unit: 'custom' } } );

			await waitFor( () => {
				expect( screen.getByText( 'CSS function' ) ).toBeInTheDocument();

				const [ sizeInput, customTextField ] = screen.getAllByRole( 'textbox', { hidden: true } );

				expect( sizeInput ).toHaveValue( 'calc(100% - 10px)' );
				expect( customTextField ).toHaveValue( 'calc(100% - 10px)' );
			} );
		} );
	} );

	describe( 'onChange', () => {
		it( 'should call onChange with custom unit when popover input value changes', async () => {
			// Arrange.
			const anchorRef = createRef< HTMLDivElement >() as React.MutableRefObject< HTMLDivElement >;
			anchorRef.current = document.createElement( 'div' );

			const onChange = jest.fn();

			renderComponent( { anchorRef, value: { size: '10px', unit: 'custom' }, onChange } );

			await waitFor( () => {
				expect( screen.getByText( 'CSS function' ) ).toBeInTheDocument();
			} );

			const [ , customTextField ] = screen.getAllByRole( 'textbox', { hidden: true } );

			// Act.
			fireEvent.change( customTextField, { target: { value: 'calc(50% + 20px)' } } );

			// Assert.
			expect( onChange ).toHaveBeenCalledTimes( 1 );
			expect( onChange ).toHaveBeenCalledWith( { size: 'calc(50% + 20px)', unit: 'custom' } );
		} );
	} );
} );
