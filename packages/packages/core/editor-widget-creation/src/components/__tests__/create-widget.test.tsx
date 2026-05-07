import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CreateWidget } from '../create-widget';

const mockIsAngieAvailable = jest.fn();
const mockSendPromptToAngie = jest.fn();
const mockInstallAngiePlugin = jest.fn();
const mockRedirectToAppAdmin = jest.fn();
const mockRedirectToInstallation = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
	sendPromptToAngie: ( ...args: unknown[] ) => mockSendPromptToAngie( ...args ),
	installAngiePlugin: () => mockInstallAngiePlugin(),
	redirectToAppAdmin: ( ...args: unknown[] ) => mockRedirectToAppAdmin( ...args ),
	redirectToInstallation: ( ...args: unknown[] ) => mockRedirectToInstallation( ...args ),
} ) );

const mockTrackEvent = jest.fn();

jest.mock( '@elementor/events', () => ( {
	trackEvent: ( ...args: unknown[] ) => mockTrackEvent( ...args ),
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	ThemeProvider: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
} ) );

jest.mock( '@elementor/ui', () => ( {
	Button: ( {
		children,
		onClick,
		disabled,
		startIcon,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		disabled?: boolean;
		startIcon?: React.ReactNode;
	} ) => (
		<button onClick={ onClick } disabled={ disabled }>
			{ startIcon }
			{ children }
		</button>
	),
	CircularProgress: () => null,
	Dialog: ( { children, open }: { children: React.ReactNode; open: boolean; onClose?: () => void } ) =>
		open ? <div role="dialog">{ children }</div> : null,
	DialogContent: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	IconButton: ( {
		children,
		onClick,
		'aria-label': ariaLabel,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		'aria-label'?: string;
	} ) => (
		<button onClick={ onClick } aria-label={ ariaLabel }>
			{ children }
		</button>
	),
	Image: () => null,
	Stack: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	Typography: ( { children }: { children: React.ReactNode } ) => <span>{ children }</span>,
} ) );

jest.mock( '@elementor/icons', () => ( {
	XIcon: () => null,
} ) );

const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';

function dispatchCreateWidgetEvent( detail: { prompt?: string; entry_point: string } ) {
	act( () => {
		window.dispatchEvent( new CustomEvent( CREATE_WIDGET_EVENT, { detail } ) );
	} );
}

describe( 'CreateWidget', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockSendPromptToAngie.mockReset();
		mockInstallAngiePlugin.mockReset();
		mockRedirectToAppAdmin.mockReset();
		mockRedirectToInstallation.mockReset();
		mockTrackEvent.mockReset();
	} );

	describe( 'when Angie is already installed', () => {
		beforeEach( () => {
			mockIsAngieAvailable.mockReturnValue( true );
		} );

		it( 'sends the prompt to Angie without showing the modal', () => {
			render( <CreateWidget /> );

			dispatchCreateWidgetEvent( { prompt: 'Build me a hero section', entry_point: 'top_bar' } );

			expect( mockSendPromptToAngie ).toHaveBeenCalledWith( 'Build me a hero section' );
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );

		it( 'tracks the cta event with has_angie_installed: true', () => {
			render( <CreateWidget /> );

			dispatchCreateWidgetEvent( { prompt: 'Build me something', entry_point: 'top_bar' } );

			expect( mockTrackEvent ).toHaveBeenCalledWith(
				expect.objectContaining( {
					eventName: 'angie_cta_clicked',
					has_angie_installed: true,
					entry_point: 'top_bar',
				} )
			);
		} );
	} );

	describe( 'when Angie is not installed', () => {
		beforeEach( () => {
			mockIsAngieAvailable.mockReturnValue( false );
		} );

		it( 'shows the install modal', () => {
			render( <CreateWidget /> );

			dispatchCreateWidgetEvent( { prompt: 'Build me a hero section', entry_point: 'top_bar' } );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Install Angie to build custom widgets' ) ).toBeInTheDocument();
		} );

		it( 'tracks the cta event with has_angie_installed: false', () => {
			render( <CreateWidget /> );

			dispatchCreateWidgetEvent( { prompt: 'Build me something', entry_point: 'top_bar' } );

			expect( mockTrackEvent ).toHaveBeenCalledWith(
				expect.objectContaining( {
					eventName: 'angie_cta_clicked',
					has_angie_installed: false,
					entry_point: 'top_bar',
				} )
			);
		} );

		describe( 'install flow — success', () => {
			it( 'calls redirectToAppAdmin with prompt after successful install', async () => {
				mockInstallAngiePlugin.mockResolvedValue( { success: true } );

				render( <CreateWidget /> );
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar' } );

				fireEvent.click( screen.getByRole( 'button', { name: /Install Angie/i } ) );

				await waitFor( () => {
					expect( mockRedirectToAppAdmin ).toHaveBeenCalledWith( 'Build me a widget' );
				} );
			} );

			it( 'calls redirectToAppAdmin without a prompt when no prompt is provided', async () => {
				mockInstallAngiePlugin.mockResolvedValue( { success: true } );

				render( <CreateWidget /> );
				dispatchCreateWidgetEvent( { entry_point: 'top_bar' } );

				fireEvent.click( screen.getByRole( 'button', { name: /Install Angie/i } ) );

				await waitFor( () => {
					expect( mockRedirectToAppAdmin ).toHaveBeenCalledWith( undefined );
				} );
			} );

			it( 'tracks angie_install_started when install begins', async () => {
				mockInstallAngiePlugin.mockResolvedValue( { success: true } );

				render( <CreateWidget /> );
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar' } );

				fireEvent.click( screen.getByRole( 'button', { name: /Install Angie/i } ) );

				await waitFor( () => {
					expect( mockTrackEvent ).toHaveBeenCalledWith(
						expect.objectContaining( {
							eventName: 'angie_install_started',
							trigger_source: 'top_bar',
						} )
					);
				} );
			} );
		} );

		describe( 'install flow — failure', () => {
			it( 'shows error state and Install Manually button on failure', async () => {
				mockInstallAngiePlugin.mockResolvedValue( { success: false } );

				render( <CreateWidget /> );
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar' } );

				fireEvent.click( screen.getByRole( 'button', { name: /Install Angie/i } ) );

				await waitFor( () => {
					expect( screen.getByText( 'Installation failed' ) ).toBeInTheDocument();
					expect( screen.getByRole( 'button', { name: /Install Manually/i } ) ).toBeInTheDocument();
				} );
			} );

			it( 'calls redirectToInstallation with prompt when Install Manually is clicked', async () => {
				mockInstallAngiePlugin.mockResolvedValue( { success: false } );

				render( <CreateWidget /> );
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar' } );

				fireEvent.click( screen.getByRole( 'button', { name: /Install Angie/i } ) );

				await waitFor( () => {
					expect( screen.getByRole( 'button', { name: /Install Manually/i } ) ).toBeInTheDocument();
				} );

				fireEvent.click( screen.getByRole( 'button', { name: /Install Manually/i } ) );

				expect( mockRedirectToInstallation ).toHaveBeenCalledWith( 'Build me a widget' );
			} );

			it( 'calls redirectToInstallation without a prompt when no prompt is provided', async () => {
				mockInstallAngiePlugin.mockResolvedValue( { success: false } );

				render( <CreateWidget /> );
				dispatchCreateWidgetEvent( { entry_point: 'top_bar' } );

				fireEvent.click( screen.getByRole( 'button', { name: /Install Angie/i } ) );

				await waitFor( () => {
					expect( screen.getByRole( 'button', { name: /Install Manually/i } ) ).toBeInTheDocument();
				} );

				fireEvent.click( screen.getByRole( 'button', { name: /Install Manually/i } ) );

				expect( mockRedirectToInstallation ).toHaveBeenCalledWith( undefined );
			} );
		} );

		describe( 'modal close behavior', () => {
			it( 'closes the modal when close button is clicked while idle', () => {
				mockInstallAngiePlugin.mockResolvedValue( { success: true } );

				render( <CreateWidget /> );
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar' } );

				expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();

				fireEvent.click( screen.getByLabelText( 'Close' ) );

				expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
			} );

			it( 'cannot close the modal while install is in progress', async () => {
				mockInstallAngiePlugin.mockReturnValue( new Promise( () => {} ) ); // never resolves

				render( <CreateWidget /> );
				dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'top_bar' } );

				fireEvent.click( screen.getByRole( 'button', { name: /Install Angie/i } ) );

				await waitFor( () => {
					expect( screen.getByRole( 'button', { name: /Installing…/i } ) ).toBeInTheDocument();
				} );

				fireEvent.click( screen.getByLabelText( 'Close' ) );

				expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			} );
		} );
	} );
} );
