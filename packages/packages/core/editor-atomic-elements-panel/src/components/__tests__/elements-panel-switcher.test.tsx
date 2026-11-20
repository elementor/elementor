import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { getElementsPanelSelection, setElementsPanelSelection } from '../../elements-panel-selection';
import { ElementsPanelSwitcher } from '../elements-panel-switcher';

const mockIsDragging = jest.fn();

jest.mock( '../../hooks/use-is-dragging', () => ( { useIsDragging: () => mockIsDragging() } ) );

describe( 'ElementsPanelSwitcher', () => {
	const open = jest.fn();
	const close = jest.fn();

	beforeEach( () => {
		open.mockClear();
		close.mockClear();
		mockIsDragging.mockReturnValue( false );
		setElementsPanelSelection( 'atomic' );
	} );

	it( 'should save legacy and close the atomic panel when switching to legacy', () => {
		// Arrange.
		render( <ElementsPanelSwitcher value="atomic" isBlocked={ false } open={ open } close={ close } /> );

		// Act.
		fireEvent.click( screen.getByLabelText( 'Legacy elements panel' ) );

		// Assert.
		expect( getElementsPanelSelection() ).toBe( 'non_atomic' );
		expect( close ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should save atomic and open the atomic panel when switching to atomic', () => {
		// Arrange.
		setElementsPanelSelection( 'non_atomic' );
		render( <ElementsPanelSwitcher value="non_atomic" isBlocked={ false } open={ open } close={ close } /> );

		// Act.
		fireEvent.click( screen.getByLabelText( 'Atomic elements panel' ) );

		// Assert.
		expect( getElementsPanelSelection() ).toBe( 'atomic' );
		expect( open ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not switch while dragging', () => {
		// Arrange.
		mockIsDragging.mockReturnValue( true );
		render( <ElementsPanelSwitcher value="atomic" isBlocked={ false } open={ open } close={ close } /> );

		// Act.
		fireEvent.click( screen.getByLabelText( 'Legacy elements panel' ) );

		// Assert.
		expect( getElementsPanelSelection() ).toBe( 'atomic' );
		expect( close ).not.toHaveBeenCalled();
	} );

	it( 'should not switch when the panel is blocked', () => {
		// Arrange.
		render( <ElementsPanelSwitcher value="atomic" isBlocked={ true } open={ open } close={ close } /> );

		// Act.
		fireEvent.click( screen.getByLabelText( 'Legacy elements panel' ) );

		// Assert.
		expect( getElementsPanelSelection() ).toBe( 'atomic' );
		expect( close ).not.toHaveBeenCalled();
	} );
} );
