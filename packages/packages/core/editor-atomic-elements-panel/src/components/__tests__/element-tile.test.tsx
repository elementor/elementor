import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ElementTile } from '../element-tile';

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

	it( 'should show the crown only on locked tiles', () => {
		// Arrange & Act.
		const { rerender } = render( <ElementTile tile={ tile } groupId="form" /> );
		const withoutCrown = screen.queryByLabelText( 'Upgrade' );
		rerender( <ElementTile tile={ { ...tile, promotionType: 'atomic-form' } } groupId="form" /> );

		// Assert.
		expect( withoutCrown ).not.toBeInTheDocument();
		expect( screen.getByLabelText( 'Upgrade' ) ).toBeInTheDocument();
	} );
} );
