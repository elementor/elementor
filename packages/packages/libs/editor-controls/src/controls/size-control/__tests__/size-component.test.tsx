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

const createAnchorRef = () => {
	const anchorRef = createRef< HTMLDivElement >() as React.MutableRefObject< HTMLDivElement >;

	anchorRef.current = document.createElement( 'div' );

	return anchorRef;
};

const openPopover = async () => {
	const sizeInput = screen.getByRole( 'textbox', { hidden: true } );

	fireEvent.click( sizeInput );

	await waitFor( () => {
		expect( screen.getByText( 'CSS function' ) ).toBeInTheDocument();
	} );
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
			// Arrange & Act.
			renderComponent( {
				anchorRef: createAnchorRef(),
				value: { size: 'calc(100% - 10px)', unit: 'custom' },
			} );

			// Assert.
			expect( screen.queryByText( 'CSS function' ) ).not.toBeInTheDocument();
		} );

		it( 'should render TextFieldPopover when unit is custom and anchorRef has current and popup is open', async () => {
			// Arrange.
			const anchorRef = createAnchorRef();

			// Act.
			renderComponent( { anchorRef, value: { size: 'calc(100% - 10px)', unit: 'custom' } } );

			await openPopover();

			await waitFor( () => {
				const [ sizeInput, customTextField ] = screen.getAllByRole( 'textbox', { hidden: true } );

				expect( sizeInput ).toHaveValue( 'calc(100% - 10px)' );
				expect( customTextField ).toHaveValue( 'calc(100% - 10px)' );
			} );
		} );
	} );

	describe( 'onChange', () => {
		it( 'should call onChange with custom unit when popover input value changes', async () => {
			// Arrange.
			const anchorRef = createAnchorRef();

			const onChange = jest.fn();

			renderComponent( { anchorRef, value: { size: '10px', unit: 'custom' }, onChange } );

			await openPopover();

			const [ , customTextField ] = screen.getAllByRole( 'textbox', { hidden: true } );

			// Act.
			fireEvent.change( customTextField, { target: { value: 'calc(50% + 20px)' } } );

			// Assert.
			expect( onChange ).toHaveBeenCalledTimes( 1 );
			expect( onChange ).toHaveBeenCalledWith( { size: 'calc(50% + 20px)', unit: 'custom' } );
		} );

		it( 'should reflect parent value update in both size field and popover input when controlled', async () => {
			// Arrange.
			const onChange = jest.fn();
			const anchorRef = createAnchorRef();

			// Act.
			const { rerender } = render(
				<SizeComponent
					value={ { size: 'calc(100% - 10px)', unit: 'custom' } }
					units={ [ 'px', 'rem', 'custom', 'em' ] }
					onChange={ onChange }
					anchorRef={ anchorRef }
				/>
			);

			await openPopover();

			const [ mainInput, popoverInput ] = screen.getAllByRole( 'textbox', { hidden: true } );
			expect( mainInput ).toHaveValue( 'calc(100% - 10px)' );
			expect( popoverInput ).toHaveValue( 'calc(100% - 10px)' );

			rerender(
				<SizeComponent
					value={ { size: 'clamp(1 + 20 + 4)', unit: 'custom' } }
					units={ [ 'px', 'rem', 'custom', 'em' ] }
					onChange={ onChange }
					anchorRef={ anchorRef }
				/>
			);

			// Assert.
			await waitFor( () => {
				const [ main, popover ] = screen.getAllByRole( 'textbox', { hidden: true } );
				expect( main ).toHaveValue( 'clamp(1 + 20 + 4)' );
				expect( popover ).toHaveValue( 'clamp(1 + 20 + 4)' );
			} );
		} );
	} );

	describe( 'Click to open custom popover', () => {
		it( 'should open popover when main size field input is clicked and unit is custom', async () => {
			// Arrange.
			const anchorRef = createAnchorRef();

			// Act.
			renderComponent( { anchorRef, value: { size: 'calc(1em)', unit: 'custom' } } );

			const [ mainInput, popoverInput ] = screen.getAllByRole( 'textbox', { hidden: true } );

			// Assert.
			expect( popoverInput ).toBeUndefined();

			fireEvent.click( mainInput );

			await waitFor( () => {
				expect( screen.getByText( 'CSS function' ) ).toBeInTheDocument();
			} );
		} );

		it( 'should not open custom popover when unit selector is clicked (not the input)', async () => {
			// Arrange.
			const anchorRef = createAnchorRef();

			// Act.
			renderComponent( { anchorRef, value: { size: '10px', unit: 'custom' } } );

			const buttons = screen.getAllByRole( 'button', { hidden: true } );
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			fireEvent.click( buttons.find( ( btn ) => btn.getAttribute( 'aria-haspopup' ) === 'true' )! );

			// Assert.
			expect( screen.getByRole( 'menuitem', { name: 'REM' } ) ).toBeInTheDocument();
			expect( screen.queryByText( 'CSS function' ) ).not.toBeInTheDocument();
		} );
	} );
} );
