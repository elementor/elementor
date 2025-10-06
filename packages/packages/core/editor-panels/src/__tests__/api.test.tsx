import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { __privateUseRouteStatus as useRouteStatus } from '@elementor/editor-v1-adapters';
import { __createStore, __registerSlice, __StoreProvider as StoreProvider } from '@elementor/store';
import { act, fireEvent, renderHook, screen } from '@testing-library/react';

import { createPanel, type PanelDeclaration, registerPanel } from '../api';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '../components/external';
import Panels from '../components/internal/panels';
import { slice } from '../store';

jest.mock( '@elementor/editor-v1-adapters' );

describe( 'panels api', () => {
	beforeEach( () => {
		// Setup for the environment.
		document.body.innerHTML = `
			<div id="elementor-editor-wrapper">
				<div id="elementor-panel-inner"></div>
			</div>
		`;

		jest.mocked( useRouteStatus ).mockReturnValue( {
			isActive: false,
			isBlocked: false,
		} );
	} );

	afterEach( () => {
		// Cleanup for the environment.
		document.body.innerHTML = '';
	} );

	it( 'should open the panel when triggering `open` action', () => {
		// Arrange.
		const mockPanel = createMockPanel();

		registerPanel( mockPanel.panel );

		// Act.
		renderPanel( mockPanel );

		// Assert.
		expect( screen.queryByText( 'Test Panel Header' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Test Panel Body' ) ).not.toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByText( 'Open Panel' ) );

		// Assert.
		expect( screen.getByText( 'Test Panel Header' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test Panel Body' ) ).toBeInTheDocument();
	} );

	it( 'should close the panel when triggering `close` action', () => {
		// Arrange.
		const mockPanel = createMockPanel();

		registerPanel( mockPanel.panel );

		jest.mocked( useRouteStatus ).mockReturnValue( {
			isActive: true,
			isBlocked: false,
		} );

		// Act.
		renderPanel( mockPanel );

		fireEvent.click( screen.getByText( 'Open Panel' ) );

		// Assert.
		expect( screen.getByText( 'Test Panel Header' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test Panel Body' ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByText( 'Close Panel' ) );

		// Assert.
		expect( screen.queryByText( 'Test Panel Header' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Test Panel Body' ) ).not.toBeInTheDocument();
	} );

	it( 'should not open the panel if the panel was not registered', () => {
		// Arrange.
		const mockPanel = createMockPanel();

		// Act.
		renderPanel( mockPanel );

		fireEvent.click( screen.getByText( 'Open Panel' ) );

		// Assert.
		expect( screen.queryByText( 'Test Panel Header' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Test Panel Body' ) ).not.toBeInTheDocument();
	} );

	it( 'should block open panel when isBlocked state equals `true`', () => {
		// Arrange.
		const mockPanel = createMockPanel();

		registerPanel( mockPanel.panel );

		jest.mocked( useRouteStatus ).mockReturnValue( {
			isActive: false,
			isBlocked: true,
		} );

		// Act.
		renderPanel( mockPanel );

		// Assert.
		expect( screen.getByText( 'Open Panel' ) ).toBeDisabled();
	} );

	it( 'should run callbacks on open and close', () => {
		// Arrange.
		let opened = false;
		let closed = false;

		jest.mocked( useRouteStatus ).mockReturnValue( {
			isActive: true,
			isBlocked: false,
		} );

		const mockPanel = createMockPanel( {
			onOpen: () => {
				opened = true;
			},
			onClose: () => {
				closed = true;
			},
		} );

		renderPanel( mockPanel );

		// Act.
		fireEvent.click( screen.getByText( 'Open Panel' ) );

		// Assert.
		expect( opened ).toBe( true );

		// Act.
		fireEvent.click( screen.getByText( 'Close Panel' ) );

		// Assert.
		expect( closed ).toBe( true );
	} );

	it( 'should share state snapshot between open and close actions', () => {
		// Arrange.
		const onClose = jest.fn();
		const state = { foo: 'bar' };

		const mockPanel = createMockPanel( {
			onOpen: () => state,
			onClose,
		} );

		__registerSlice( slice );
		registerPanel( mockPanel.panel );

		// Act.
		const { open, close } = renderHook( () => mockPanel.usePanelActions(), {
			wrapper: ( { children } ) => <StoreProvider store={ __createStore() }>{ children }</StoreProvider>,
		} ).result.current;

		act( () => {
			open();
			close();
		} );

		// Assert.
		expect( onClose ).toHaveBeenCalledWith( state );
	} );
} );

function createMockPanel( options: Partial< PanelDeclaration > = {} ) {
	return createPanel( {
		id: 'test-panel',
		component: () => (
			<Panel>
				<PanelHeader>
					<PanelHeaderTitle>Test Panel Header</PanelHeaderTitle>
				</PanelHeader>
				<PanelBody>
					<p>Test Panel Body</p>
				</PanelBody>
			</Panel>
		),
		...options,
	} );
}

function renderPanel( panel: ReturnType< typeof createPanel > ) {
	const Trigger = () => {
		const { isOpen, isBlocked } = panel.usePanelStatus();
		const { open, close } = panel.usePanelActions();

		return (
			<button onClick={ () => ( isOpen ? close() : open() ) } disabled={ isBlocked }>
				{ isOpen ? 'Close Panel' : 'Open Panel' }
			</button>
		);
	};

	__registerSlice( slice );

	renderWithTheme(
		<StoreProvider store={ __createStore() }>
			<Panels />
			<Trigger />
		</StoreProvider>
	);
}
