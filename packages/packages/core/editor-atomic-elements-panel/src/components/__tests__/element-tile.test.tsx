import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { insertElement } from '../../utils/insert-element';
import { ElementTile } from '../element-tile';

jest.mock( '../../utils/insert-element', () => ( {
	canInsertElements: () => true,
	insertElement: jest.fn(),
} ) );

const tile = { elType: 'widget', widgetType: 'e-form', title: 'Form' };

describe( 'ElementTile', () => {
	it( 'should open the promotion with the tile title when a locked tile is clicked', () => {
		// Arrange.
		const listener = jest.fn();
		document.addEventListener( 'atomic-form-promotion:open', listener );
		render( <ElementTile tile={ { ...tile, promotionType: 'atomic-form' } } groupId="form" /> );

		// Act.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Assert.
		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( listener.mock.calls[ 0 ][ 0 ].detail.title ).toBe( 'Form' );
		document.removeEventListener( 'atomic-form-promotion:open', listener );
	} );

	it( 'should open the promotion when Enter is pressed on a focused locked tile', async () => {
		// Arrange.
		const listener = jest.fn();
		document.addEventListener( 'atomic-form-promotion:open', listener );
		render( <ElementTile tile={ { ...tile, promotionType: 'atomic-form' } } groupId="form" /> );
		screen.getByRole( 'button' ).focus();

		// Act.
		await userEvent.keyboard( '{Enter}' );

		// Assert.
		expect( listener ).toHaveBeenCalledTimes( 1 );
		document.removeEventListener( 'atomic-form-promotion:open', listener );
	} );

	it( 'should not open a promotion when a regular tile is clicked', () => {
		// Arrange.
		const listener = jest.fn();
		document.addEventListener( 'atomic-form-promotion:open', listener );
		render( <ElementTile tile={ tile } groupId="form" /> );

		// Act.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Assert.
		expect( listener ).not.toHaveBeenCalled();
		document.removeEventListener( 'atomic-form-promotion:open', listener );
	} );

	it( 'should show the crown only on locked tiles', () => {
		// Arrange & Act.
		const { rerender } = render( <ElementTile tile={ tile } groupId="form" /> );
		const withoutCrown = screen.queryByRole( 'img', { name: 'Upgrade' } );
		rerender( <ElementTile tile={ { ...tile, promotionType: 'atomic-form' } } groupId="form" /> );

		// Assert.
		expect( withoutCrown ).not.toBeInTheDocument();
		expect( screen.getByRole( 'img', { name: 'Upgrade' } ) ).toBeInTheDocument();
	} );

	it( 'should insert the element when a regular tile is clicked', () => {
		// Arrange.
		render( <ElementTile tile={ tile } groupId="form" /> );

		// Act.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Assert.
		expect( insertElement ).toHaveBeenCalledWith( tile );
	} );
} );
