import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { trackViewPromotion } from '@elementor/editor-controls';
import { fireEvent, screen } from '@testing-library/react';

import { Replay } from '../replay';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	trackViewPromotion: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

describe( 'Replay', () => {
	const mockOnChange = jest.fn();

	const defaultProps = {
		value: false,
		onChange: mockOnChange,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render toggle buttons with Yes button promotion locked', () => {
		// Arrange & Act.
		renderWithTheme( <Replay { ...defaultProps } /> );

		// Assert.
		const noButton = screen.getByRole( 'button', { name: 'No' } );
		const yesButton = screen.getByRole( 'button', { name: 'Yes' } );

		expect( noButton ).toBeInTheDocument();
		expect( noButton ).toBeEnabled();
		expect( yesButton ).toBeInTheDocument();
		expect( yesButton ).toBeEnabled();
	} );

	it( 'should call onChange when No button is clicked', () => {
		// Arrange.
		renderWithTheme( <Replay { ...defaultProps } /> );

		// Act.
		const noButton = screen.getByRole( 'button', { name: 'No' } );
		fireEvent.click( noButton );

		// Assert.
		expect( mockOnChange ).toHaveBeenCalled();
	} );

	it( 'should show promotion popover when clicking locked Yes button', () => {
		// Arrange.
		renderWithTheme( <Replay { ...defaultProps } /> );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Yes' } ) );

		// Assert.
		expect( mockOnChange ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		expect( trackViewPromotion ).toHaveBeenCalledWith( {
			target_name: 'interactions_replay',
			location_l2: 'interactions',
			target_value: 'yes',
		} );
	} );

	it( 'should show promotion popover when clicking promotion chip', () => {
		// Arrange.
		renderWithTheme( <Replay { ...defaultProps } /> );

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
