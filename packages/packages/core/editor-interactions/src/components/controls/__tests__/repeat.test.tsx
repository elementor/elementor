import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { Repeat } from '../repeat';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

describe( 'Repeat', () => {
	const defaultProps = {
		value: '',
		onChange: jest.fn(),
	};

	it( 'should render toggle buttons with both buttons disabled', () => {
		// Arrange & Act.
		renderWithTheme( <Repeat/> );

		// Assert.
		const timesButton = screen.getByRole( 'button', { name: 'Enable number' } );
		const loopButton = screen.getByRole( 'button', { name: 'Infinite repeat' } );

		expect( timesButton ).toBeInTheDocument();
		expect( timesButton ).toBeDisabled();
		expect( loopButton ).toBeInTheDocument();
		expect( loopButton ).toBeDisabled();
	} );

	it( 'should show promotion popover when clicking promotion chip', () => {
		// Arrange.
		renderWithTheme( <Repeat/> );

		// Assert.
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

		// Act.
		const promotionChip = screen.getByLabelText( 'Promotion chip' );
		fireEvent.click( promotionChip );

		// Assert.
		expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Upgrade now' ) ).toBeInTheDocument();
	} );
} );
