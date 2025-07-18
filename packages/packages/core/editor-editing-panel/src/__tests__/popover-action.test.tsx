import * as React from 'react';
import { useFloatingActionsBar } from '@elementor/editor-controls';
import { fireEvent, render, screen } from '@testing-library/react';

import { PopoverAction } from '../popover-action';

jest.mock( '@elementor/editor-controls' );

describe( 'PopoverAction', () => {
	beforeEach( () => {
		jest.mocked( useFloatingActionsBar ).mockReturnValue( {
			setOpen: jest.fn(),
			open: false,
		} );
	} );

	it( 'renders the icon button with the correct title', () => {
		// Arrange.
		const title = 'Test Action';
		const Icon = () => <span>Icon</span>;
		const content = () => <div>Content</div>;

		// Act.
		render( <PopoverAction title={ title } icon={ Icon } content={ content } /> );

		// Assert.
		const button = screen.getByRole( 'button', { name: title } );
		expect( button ).toBeInTheDocument();
		expect( screen.getByText( 'Icon' ) ).toBeInTheDocument();
	} );

	it( 'does not render when visible is false', () => {
		// Arrange & Act.
		const { container } = render(
			<PopoverAction
				title="Hidden Action"
				icon={ () => <span>Icon</span> }
				content={ () => <div>Content</div> }
				visible={ false }
			/>
		);

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the popover with the content', () => {
		// Arrange.
		const title = 'Test Action';
		const Icon = () => <span>Icon</span>;
		const content = () => <div> Content </div>;

		// Act.
		render( <PopoverAction title={ title } icon={ Icon } content={ content } /> );

		fireEvent.click( screen.getByRole( 'button', { name: title } ) );

		// Assert.
		expect( screen.getByText( 'Content' ) ).toBeInTheDocument();
	} );

	it( 'calls setOpen when the button is clicked', () => {
		// Arrange.
		const setOpenMock = jest.fn();
		jest.mocked( useFloatingActionsBar ).mockReturnValue( {
			setOpen: setOpenMock,
			open: false,
		} );

		const title = 'Test Action';
		const Icon = () => <span>Icon</span>;
		const content = () => <div>Content</div>;

		// Act.
		render( <PopoverAction title={ title } icon={ Icon } content={ content } /> );

		fireEvent.click( screen.getByRole( 'button', { name: title } ) );

		// Assert.
		expect( setOpenMock ).toHaveBeenCalledWith( true );
	} );

	it( 'closes the popover when the close function is called', () => {
		// Arrange.
		const setOpenMock = jest.fn();
		jest.mocked( useFloatingActionsBar ).mockReturnValue( {
			setOpen: setOpenMock,
			open: true,
		} );

		const title = 'Test Action';
		const Icon = () => <span>Icon</span>;

		// Act.
		render(
			<PopoverAction
				title={ title }
				icon={ Icon }
				content={ ( { close } ) => (
					<div>
						Content
						<button onClick={ close }>Close</button>
					</div>
				) }
			/>
		);

		fireEvent.click( screen.getByRole( 'button', { name: title } ) );

		// Assert.
		expect( setOpenMock ).toHaveBeenCalledWith( true );

		setOpenMock.mockClear();

		// Act.
		fireEvent.click( screen.getByText( 'Close' ) );

		expect( setOpenMock ).toHaveBeenCalledWith( false );
	} );
} );
