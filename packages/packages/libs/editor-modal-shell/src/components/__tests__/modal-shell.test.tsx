import * as React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';

import { ModalShell, useModalShell } from '../modal-shell';

const EXIT_TRANSITION_MS = 225;

function mockMatchMedia( reducedMotion: boolean ) {
	Object.defineProperty( window, 'matchMedia', {
		writable: true,
		configurable: true,
		value: jest.fn().mockImplementation( ( query: string ) => ( {
			matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
			media: query,
			addListener: jest.fn(),
			removeListener: jest.fn(),
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
			onchange: null,
		} ) ),
	} );
}

beforeEach( () => {
	mockMatchMedia( false );
	jest.useFakeTimers();
} );

afterEach( () => {
	if ( jest.isMockFunction( setTimeout ) ) {
		jest.runOnlyPendingTimers();
	}

	jest.useRealTimers();
} );

describe( 'ModalShell', () => {
	it( 'should render children inside the dialog', () => {
		render(
			<ModalShell>
				<div>shell content</div>
			</ModalShell>
		);

		expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		expect( screen.getByText( 'shell content' ) ).toBeInTheDocument();
	} );

	it( 'should render the close button by default', () => {
		render(
			<ModalShell>
				<div>x</div>
			</ModalShell>
		);

		expect( screen.getByRole( 'button', { name: /close/i } ) ).toBeInTheDocument();
	} );

	it( 'should not render the close button when hideCloseButton is true', () => {
		render(
			<ModalShell hideCloseButton>
				<div>x</div>
			</ModalShell>
		);

		expect( screen.queryByRole( 'button', { name: /close/i } ) ).not.toBeInTheDocument();
	} );

	it( 'should call onClose only after the exit transition completes', () => {
		const onClose = jest.fn();

		render(
			<ModalShell onClose={ onClose }>
				<div>x</div>
			</ModalShell>
		);

		fireEvent.click( screen.getByRole( 'button', { name: /close/i } ) );

		expect( onClose ).not.toHaveBeenCalled();

		act( () => {
			jest.advanceTimersByTime( EXIT_TRANSITION_MS );
		} );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should ignore Escape key when closeOnEsc is false', () => {
		const onClose = jest.fn();

		render(
			<ModalShell onClose={ onClose } closeOnEsc={ false }>
				<div>x</div>
			</ModalShell>
		);

		fireEvent.keyDown( screen.getByRole( 'dialog' ), { key: 'Escape' } );

		act( () => {
			jest.advanceTimersByTime( EXIT_TRANSITION_MS );
		} );

		expect( onClose ).not.toHaveBeenCalled();
	} );

	it( 'should expose a close() function via useModalShell context', () => {
		const onClose = jest.fn();
		const ChildCta = () => {
			const { close } = useModalShell();
			return (
				<button type="button" onClick={ close }>
					trigger
				</button>
			);
		};

		render(
			<ModalShell onClose={ onClose }>
				<ChildCta />
			</ModalShell>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'trigger' } ) );

		act( () => {
			jest.advanceTimersByTime( EXIT_TRANSITION_MS );
		} );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should throw when useModalShell is used outside a provider', () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		expect( () => renderHook( () => useModalShell() ) ).toThrow(
			'useModalShell must be used inside a <ModalShell />'
		);

		consoleError.mockRestore();
	} );

	describe( 'when prefers-reduced-motion is reduce', () => {
		beforeEach( () => {
			mockMatchMedia( true );
		} );

		it( 'should close without waiting for an exit transition', () => {
			const onClose = jest.fn();

			render(
				<ModalShell onClose={ onClose }>
					<div>x</div>
				</ModalShell>
			);

			fireEvent.click( screen.getByRole( 'button', { name: /close/i } ) );

			act( () => {
				jest.advanceTimersByTime( 0 );
			} );

			expect( onClose ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
