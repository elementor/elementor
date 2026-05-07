import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { CreateWidget } from '../create-widget';

const mockIsAngieAvailable = jest.fn();
const mockTrackEvent = jest.fn();
const mockInstallAngiePlugin = jest.fn();
const mockRedirectToAppAdmin = jest.fn();
const mockSendPromptToAngie = jest.fn();
const mockRedirectToInstallation = jest.fn();

jest.mock( '@elementor/editor-mcp', () => {
	// @eslint-disable-next-line @typescript-eslint/consistent-type-imports
	const { toolPrompts } = jest.requireActual< typeof import('@elementor/editor-mcp') >( '@elementor/editor-mcp' );
	return {
		toolPrompts,
		isAngieAvailable: () => mockIsAngieAvailable(),
		installAngiePlugin: ( ...args: unknown[] ) => mockInstallAngiePlugin( ...args ),
		redirectToAppAdmin: ( ...args: unknown[] ) => mockRedirectToAppAdmin( ...args ),
		redirectToInstallation: ( ...args: unknown[] ) => mockRedirectToInstallation( ...args ),
		sendPromptToAngie: ( ...args: unknown[] ) => mockSendPromptToAngie( ...args ),
	};
} );

jest.mock( '@elementor/events', () => ( {
	trackEvent: ( ...args: unknown[] ) => mockTrackEvent( ...args ),
} ) );

const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';

function dispatchCreateWidgetEvent( detail: { prompt?: string; entry_point: string } ) {
	window.dispatchEvent( new CustomEvent( CREATE_WIDGET_EVENT, { detail } ) );
}

describe( 'CreateWidget — analytics instrumentation', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockTrackEvent.mockReset();
		mockInstallAngiePlugin.mockReset();
		mockRedirectToAppAdmin.mockReset();
		mockSendPromptToAngie.mockReset();
		mockRedirectToInstallation.mockReset();
	} );

	describe( 'ai_widget_cta_clicked', () => {
		it( 'fires ai_widget_cta_clicked with correct entry_point when Angie is NOT installed', () => {
			// Arrange.
			mockIsAngieAvailable.mockReturnValue( false );
			renderWithTheme( <CreateWidget /> );

			// Act.
			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar_icon' } );
			} );

			// Assert.
			expect( mockTrackEvent ).toHaveBeenCalledWith( {
				eventName: 'ai_widget_cta_clicked',
				entry_point: 'top_bar_icon',
				has_angie_installed: false,
			} );
		} );

		it( 'fires ai_widget_cta_clicked with has_angie_installed: true when Angie IS installed', () => {
			// Arrange.
			mockIsAngieAvailable.mockReturnValue( true );
			renderWithTheme( <CreateWidget /> );

			// Act.
			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar_icon' } );
			} );

			// Assert.
			expect( mockTrackEvent ).toHaveBeenCalledWith( {
				eventName: 'ai_widget_cta_clicked',
				entry_point: 'top_bar_icon',
				has_angie_installed: true,
			} );
		} );

		it( 'fires ai_widget_cta_clicked with a custom entry_point', () => {
			// Arrange.
			mockIsAngieAvailable.mockReturnValue( false );
			renderWithTheme( <CreateWidget /> );

			// Act.
			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'context_menu' } );
			} );

			// Assert.
			expect( mockTrackEvent ).toHaveBeenCalledWith(
				expect.objectContaining( {
					eventName: 'ai_widget_cta_clicked',
					entry_point: 'context_menu',
				} )
			);
		} );

		it( 'does NOT open the install modal and instead calls sendPromptToAngie when Angie is installed', () => {
			// Arrange.
			mockIsAngieAvailable.mockReturnValue( true );
			renderWithTheme( <CreateWidget /> );

			// Act.
			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'My prompt', entry_point: 'top_bar_icon' } );
			} );

			// Assert — modal should not be rendered.
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
			expect( mockSendPromptToAngie ).toHaveBeenCalledWith( 'My prompt' );
		} );
	} );

	describe( 'install modal', () => {
		it( 'shows the install modal when Angie is NOT installed', () => {
			// Arrange.
			mockIsAngieAvailable.mockReturnValue( false );
			renderWithTheme( <CreateWidget /> );

			// Act.
			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar_icon' } );
			} );

			// Assert.
			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'angie_install_abandoned', () => {
		it( 'fires angie_install_abandoned with abandon_step: install_modal when closing the modal in idle state', () => {
			// Arrange.
			mockIsAngieAvailable.mockReturnValue( false );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar_icon' } );
			} );

			// Act — click the close (X) button.
			const closeButton = screen.getByLabelText( 'Close' );

			fireEvent.click( closeButton );

			// Assert.
			expect( mockTrackEvent ).toHaveBeenCalledWith( {
				eventName: 'angie_install_abandoned',
				abandon_step: 'install_modal',
				trigger_source: 'top_bar_icon',
			} );
		} );

		it( 'fires angie_install_abandoned with abandon_step: install_error when closing after an install failure', async () => {
			// Arrange.
			mockIsAngieAvailable.mockReturnValue( false );
			mockInstallAngiePlugin.mockResolvedValue( { success: false } );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar_icon' } );
			} );

			// Click Install Angie to trigger the failure.
			const installButton = screen.getByRole( 'button', { name: /Install Angie/i } );

			fireEvent.click( installButton );

			// After failure, the install button becomes "Install Manually".
			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: /Install Manually/i } ) ).toBeInTheDocument();
			} );

			// Act — close the modal in error state.
			const closeButton = screen.getByLabelText( 'Close' );

			fireEvent.click( closeButton );

			// Assert.
			expect( mockTrackEvent ).toHaveBeenCalledWith( {
				eventName: 'angie_install_abandoned',
				abandon_step: 'install_error',
				trigger_source: 'top_bar_icon',
			} );
		} );

		it( 'does NOT fire angie_install_abandoned while installation is in progress', async () => {
			// Arrange — make install hang forever so state stays 'installing'.
			mockIsAngieAvailable.mockReturnValue( false );
			mockInstallAngiePlugin.mockReturnValue( new Promise( () => {} ) );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar_icon' } );
			} );

			// Click Install Angie.
			const installButton = screen.getByRole( 'button', { name: /Install Angie/i } );

			fireEvent.click( installButton );

			// The button should now show "Installing…".
			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: /Installing/i } ) ).toBeInTheDocument();
			} );

			// Attempt to close — should be blocked.
			const closeButton = screen.getByLabelText( 'Close' );

			fireEvent.click( closeButton );

			// Assert — abandoned event should NOT have fired, modal stays open.
			expect( mockTrackEvent ).not.toHaveBeenCalledWith(
				expect.objectContaining( { eventName: 'angie_install_abandoned' } )
			);
			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'angie_install_completed', () => {
		it( 'fires angie_install_completed and redirects after a successful install', async () => {
			// Arrange.
			mockIsAngieAvailable.mockReturnValue( false );
			mockInstallAngiePlugin.mockResolvedValue( { success: true } );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'My prompt', entry_point: 'top_bar_icon' } );
			} );

			// Act.
			const installButton = screen.getByRole( 'button', { name: /Install Angie/i } );

			fireEvent.click( installButton );

			// Assert.
			await waitFor( () => {
				expect( mockTrackEvent ).toHaveBeenCalledWith( {
					eventName: 'angie_install_completed',
					trigger_source: 'top_bar_icon',
				} );
			} );

			expect( mockRedirectToAppAdmin ).toHaveBeenCalledWith( 'My prompt' );
		} );

		it( 'does NOT fire angie_install_completed when install fails', async () => {
			// Arrange.
			mockIsAngieAvailable.mockReturnValue( false );
			mockInstallAngiePlugin.mockResolvedValue( { success: false } );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'My prompt', entry_point: 'top_bar_icon' } );
			} );

			// Act.
			const installButton = screen.getByRole( 'button', { name: /Install Angie/i } );

			fireEvent.click( installButton );

			// Wait for async install to settle (button changes to "Install Manually" on failure).
			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: /Install Manually/i } ) ).toBeInTheDocument();
			} );

			// Assert.
			expect( mockTrackEvent ).not.toHaveBeenCalledWith(
				expect.objectContaining( { eventName: 'angie_install_completed' } )
			);
			expect( mockRedirectToAppAdmin ).not.toHaveBeenCalled();
		} );

		it( 'fires angie_install_started before angie_install_completed in the correct order', async () => {
			// Arrange.
			mockIsAngieAvailable.mockReturnValue( false );
			mockInstallAngiePlugin.mockResolvedValue( { success: true } );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'My prompt', entry_point: 'top_bar_icon' } );
			} );

			// Act.
			const installButton = screen.getByRole( 'button', { name: /Install Angie/i } );

			fireEvent.click( installButton );

			// Wait for install to complete, then assert call order.
			await waitFor( () => {
				expect( mockTrackEvent ).toHaveBeenCalledWith(
					expect.objectContaining( { eventName: 'angie_install_completed' } )
				);
			} );

			const calls = mockTrackEvent.mock.calls.map( ( [ arg ] ) => arg.eventName );

			// ai_widget_cta_clicked fires first (on the window event), then install sequence.
			expect( calls ).toContain( 'angie_install_started' );
			expect( calls.indexOf( 'angie_install_started' ) ).toBeLessThan(
				calls.indexOf( 'angie_install_completed' )
			);
		} );
	} );
} );
