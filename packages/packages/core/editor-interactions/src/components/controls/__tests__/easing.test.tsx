import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { Easing } from '../easing';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

describe( 'Easing', () => {
	const defaultProps = {
		value: 'easeIn',
		onChange: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render with the default easing value selected', () => {
		// Arrange.
		renderWithTheme( <Easing { ...defaultProps } /> );

		// Assert.
		expect( screen.getByText( 'Ease In' ) ).toBeInTheDocument();
	} );

	it( 'should render free options as enabled and pro options as disabled', () => {
		// Arrange.
		renderWithTheme( <Easing { ...defaultProps } /> );

		// Act.
		const select = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( select );

		// Assert.
		const easeInOption = screen.getByRole( 'option', { name: 'Ease In', hidden: true } );
		expect( easeInOption ).not.toHaveAttribute( 'aria-disabled', 'true' );

		const easeInOutOption = screen.getByRole( 'option', { name: 'Ease In Out', hidden: true } );
		expect( easeInOutOption ).toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'should show promotion popover when clicking promotion chip', () => {
		// Arrange.
		renderWithTheme( <Easing { ...defaultProps } /> );

		// Act.
		const select = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( select );

		// Assert.
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

		const promotionChip = screen.getByLabelText( 'Promotion chip' );
		fireEvent.click( promotionChip );

		expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Upgrade now' ) ).toBeInTheDocument();
	} );
} );
