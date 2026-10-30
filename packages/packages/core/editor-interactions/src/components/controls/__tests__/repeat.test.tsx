import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { trackViewPromotion } from '@elementor/editor-controls';
import { fireEvent, screen } from '@testing-library/react';

import { Repeat } from '../repeat';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	trackViewPromotion: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

describe( 'Repeat', () => {
	it( 'should render toggle buttons with both buttons promotion locked', () => {
		// Arrange & Act.
		renderWithTheme( <Repeat /> );

		// Assert.
		const timesButton = screen.getByRole( 'button', { name: 'Enable number' } );
		const loopButton = screen.getByRole( 'button', { name: 'Infinite repeat' } );

		expect( timesButton ).toBeInTheDocument();
		expect( timesButton ).toBeEnabled();
		expect( loopButton ).toBeInTheDocument();
		expect( loopButton ).toBeEnabled();
	} );

	it( 'should show promotion popover when clicking a locked repeat button', () => {
		// Arrange.
		renderWithTheme( <Repeat /> );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Enable number' } ) );

		// Assert.
		expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		expect( trackViewPromotion ).toHaveBeenCalledWith( {
			target_name: 'interactions_repeat',
			location_l2: 'interactions',
			target_value: 'times',
		} );
	} );

	it( 'should show promotion popover when clicking promotion chip', () => {
		// Arrange.
		renderWithTheme( <Repeat /> );

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
