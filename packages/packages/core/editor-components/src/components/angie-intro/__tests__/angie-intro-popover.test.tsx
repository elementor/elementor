import * as React from 'react';
import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from 'test-utils';

import { AngieIntroPopover } from '../angie-intro-popover';

describe( 'AngieIntroPopover', () => {
	const onClose = jest.fn();
	const onConfirm = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render the popover with correct content when open', () => {
		// Arrange
		const anchorRef = createRef< HTMLButtonElement >();

		// Act
		renderWithTheme(
			<>
				<button ref={ anchorRef }>Anchor</button>
				<AngieIntroPopover
					open={ true }
					onClose={ onClose }
					onConfirm={ onConfirm }
					anchorRef={ anchorRef }
				/>
			</>
		);

		// Assert
		expect( screen.getByText( 'Meet Angie' ) ).toBeInTheDocument();
		expect( screen.getByText( 'New' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Build components using simple instructions.' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Start building' } ) ).toBeInTheDocument();
	} );

	it( 'should not render content when closed', () => {
		// Arrange
		const anchorRef = createRef< HTMLButtonElement >();

		// Act
		renderWithTheme(
			<>
				<button ref={ anchorRef }>Anchor</button>
				<AngieIntroPopover
					open={ false }
					onClose={ onClose }
					onConfirm={ onConfirm }
					anchorRef={ anchorRef }
				/>
			</>
		);

		// Assert
		expect( screen.queryByText( 'Meet Angie' ) ).not.toBeInTheDocument();
	} );

	it( 'should call onConfirm when clicking confirm button', () => {
		// Arrange
		const anchorRef = createRef< HTMLButtonElement >();

		// Act
		renderWithTheme(
			<>
				<button ref={ anchorRef }>Anchor</button>
				<AngieIntroPopover
					open={ true }
					onClose={ onClose }
					onConfirm={ onConfirm }
					anchorRef={ anchorRef }
				/>
			</>
		);
		fireEvent.click( screen.getByRole( 'button', { name: 'Start building' } ) );

		// Assert
		expect( onConfirm ).toHaveBeenCalled();
	} );
} );
