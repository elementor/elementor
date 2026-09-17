import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { SpotlightBackdrop } from '../spotlight-backdrop';

describe( '<SpotlightBackdrop />', () => {
	it( 'renders a button-role backdrop with the given aria label', () => {
		const onExit = jest.fn();

		renderWithTheme(
			<SpotlightBackdrop canvas={ document } element={ null } onExit={ onExit } ariaLabel="Exit" />
		);

		expect( screen.getByRole( 'button', { name: 'Exit' } ) ).toBeInTheDocument();
	} );

	it( 'calls onExit when clicking the backdrop', () => {
		const onExit = jest.fn();
		renderWithTheme(
			<SpotlightBackdrop canvas={ document } element={ null } onExit={ onExit } ariaLabel="Exit" />
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Exit' } ) );

		expect( onExit ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls onExit when pressing Enter or Space on the backdrop', () => {
		const onExit = jest.fn();
		renderWithTheme(
			<SpotlightBackdrop canvas={ document } element={ null } onExit={ onExit } ariaLabel="Exit" />
		);
		const backdrop = screen.getByRole( 'button', { name: 'Exit' } );

		fireEvent.keyDown( backdrop, { key: 'Enter' } );
		fireEvent.keyDown( backdrop, { key: ' ' } );

		expect( onExit ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not apply a clip-path when no element is provided', () => {
		const onExit = jest.fn();

		renderWithTheme(
			<SpotlightBackdrop canvas={ document } element={ null } onExit={ onExit } ariaLabel="Exit" />
		);

		expect( screen.getByRole( 'button', { name: 'Exit' } ) ).not.toHaveStyle( {
			clipPath: expect.stringContaining( 'path' ),
		} );
	} );
} );
