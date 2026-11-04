import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { CreateWidget } from '../create-widget';

const mockIsAngieAvailable = jest.fn();
const mockTrackEvent = jest.fn();
const mockSaveAngieConsent = jest.fn();
const mockSendPromptToAngie = jest.fn();

jest.mock( '@elementor/editor-mcp', () => {
	const { toolPrompts } = jest.requireActual( '@elementor/editor-mcp' ) as { toolPrompts: unknown };
	return {
		toolPrompts,
		isAngieAvailable: () => mockIsAngieAvailable(),
		saveAngieConsent: ( ...args: unknown[] ) => mockSaveAngieConsent( ...args ),
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
		mockSaveAngieConsent.mockReset().mockResolvedValue( undefined );
		mockSendPromptToAngie.mockReset();
	} );

	describe( 'ai_widget_cta_clicked', () => {
		it( 'fires ai_widget_cta_clicked with correct entry_point when Angie is NOT installed', () => {
			mockIsAngieAvailable.mockReturnValue( false );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar_icon' } );
			} );

			expect( mockTrackEvent ).toHaveBeenCalledWith( {
				eventName: 'ai_widget_cta_clicked',
				entry_point: 'top_bar_icon',
				has_angie_installed: false,
			} );
		} );

		it( 'fires ai_widget_cta_clicked with has_angie_installed: true when Angie IS installed', () => {
			mockIsAngieAvailable.mockReturnValue( true );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar_icon' } );
			} );

			expect( mockTrackEvent ).toHaveBeenCalledWith( {
				eventName: 'ai_widget_cta_clicked',
				entry_point: 'top_bar_icon',
				has_angie_installed: true,
			} );
		} );

		it( 'does NOT open the install modal and instead calls sendPromptToAngie when Angie is installed', () => {
			mockIsAngieAvailable.mockReturnValue( true );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'My prompt', entry_point: 'top_bar_icon' } );
			} );

			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
			expect( mockSendPromptToAngie ).toHaveBeenCalledWith( 'My prompt' );
		} );
	} );

	describe( 'install modal', () => {
		it( 'shows the install modal when Angie is NOT installed', () => {
			mockIsAngieAvailable.mockReturnValue( false );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar_icon' } );
			} );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'angie_install_abandoned', () => {
		it( 'fires angie_install_abandoned with abandon_step: install_modal when closing the modal', () => {
			mockIsAngieAvailable.mockReturnValue( false );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar_icon' } );
			} );

			fireEvent.click( screen.getByLabelText( 'Close' ) );

			expect( mockTrackEvent ).toHaveBeenCalledWith( {
				eventName: 'angie_install_abandoned',
				abandon_step: 'install_modal',
				trigger_source: 'top_bar_icon',
			} );
		} );
	} );

	describe( 'consent saving', () => {
		it( 'saves consent to DB when Continue is clicked', async () => {
			mockIsAngieAvailable.mockReturnValue( false );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'My prompt', entry_point: 'top_bar_icon' } );
			} );

			fireEvent.click( screen.getByRole( 'checkbox' ) );
			fireEvent.click( screen.getByRole( 'button', { name: /^Continue$/i } ) );

			await waitFor( () => {
				expect( mockSaveAngieConsent ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		it( 'allows closing the modal when saveAngieConsent rejects', async () => {
			mockIsAngieAvailable.mockReturnValue( false );
			mockSaveAngieConsent.mockRejectedValue( new Error( 'save failed' ) );
			renderWithTheme( <CreateWidget /> );

			act( () => {
				dispatchCreateWidgetEvent( { prompt: 'My prompt', entry_point: 'top_bar_icon' } );
			} );

			fireEvent.click( screen.getByRole( 'checkbox' ) );
			fireEvent.click( screen.getByRole( 'button', { name: /^Continue$/i } ) );

			await waitFor( () => {
				expect( mockSaveAngieConsent ).toHaveBeenCalledTimes( 1 );
			} );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: /^Continue$/i } ) ).toBeEnabled();

			fireEvent.click( screen.getByLabelText( 'Close' ) );

			await waitFor( () => {
				expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
			} );
		} );
	} );
} );
