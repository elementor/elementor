import { fireEvent, render, screen } from '@testing-library/react';

import { FloatingCheckBar } from 'elementor/modules/agents/assets/js/admin/scanner/components/floating-check-bar';

const COOLDOWN_MS = 2 * 60 * 60 * 1000;

describe( 'FloatingCheckBar', () => {
	it( 'calls onCheck when Check my site is clicked', () => {
		// Arrange
		const onCheck = jest.fn();
		render( <FloatingCheckBar onCheck={ onCheck } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );

		// Assert
		expect( onCheck ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disables the button and shows the next scan time during the cooldown', () => {
		// Arrange
		const onCheck = jest.fn();
		const retryAt = new Date( Date.now() + COOLDOWN_MS ).toISOString();
		render( <FloatingCheckBar retryAt={ retryAt } onCheck={ onCheck } /> );

		// Act
		const button = screen.getByRole( 'button', { name: /Next scan/ } );
		fireEvent.click( button );

		// Assert
		expect( button.disabled ).toBe( true );
		expect( onCheck ).not.toHaveBeenCalled();
	} );
} );
