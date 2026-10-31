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

	it( 'should render pro options as promotion-locked but still clickable', () => {
		// Arrange.
		renderWithTheme( <Easing { ...defaultProps } /> );

		// Act.
		const select = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( select );

		// Assert.
		const easeInOption = screen.getByRole( 'option', { name: 'Ease In', hidden: true } );
		expect( easeInOption ).not.toHaveAttribute( 'data-promotion-locked-option' );

		const easeInOutOption = screen.getByRole( 'option', { name: /Ease In Out, Pro/i, hidden: true } );
		expect( easeInOutOption ).toHaveAttribute( 'data-promotion-locked-option' );
		expect( easeInOutOption ).not.toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'should show promotion popover when clicking promotion chip', () => {
		// Arrange.
		renderWithTheme( <Easing { ...defaultProps } /> );

		// Act.
		const select = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( select );

		// Assert.
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

		const promotionChip = screen.getByText( 'PRO features' );
		fireEvent.mouseDown( promotionChip );

		expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Upgrade now' ) ).toBeInTheDocument();
	} );
} );
