import * as React from 'react';
import { type ComponentType } from 'react';
import { renderWithTheme } from 'test-utils';
import {
	__createStore,
	__deleteStore,
	__getState,
	__getStore,
	__registerSlice,
	__StoreProvider as StoreProvider,
} from '@elementor/store';
import { act, fireEvent, renderHook, screen } from '@testing-library/react';

import { createFloatingPanel, registerFloatingPanel } from '../api';
import { FloatingPanelBody, FloatingPanelHeader } from '../components/external';
import FloatingPanelsHost from '../components/internal/host';
import { encodePersistedState } from '../persistence';
import { selectIsDraggable, selectIsResizable, selectPanelState } from '../store/selectors';
import { slice } from '../store/slice';
import { type PanelStateStorage, sync } from '../sync';
import { type FloatingPanelDeclaration, type FloatingPanelState } from '../types';
import { mockEditMode } from './mock-edit-mode';

const Icon: ComponentType = () => null;
const Body: ComponentType = () => null;

const declaration: FloatingPanelDeclaration = {
	id: 'audit-panel',
	title: 'Audit',
	icon: Icon,
	component: Body,
	defaults: {
		width: 320,
		height: 480,
		minWidth: 240,
		minHeight: 320,
	},
};

function memoryStorage( initial: string | null = null ): PanelStateStorage {
	let value = initial;

	return {
		read: () => value,
		write: ( v ) => {
			value = v;
		},
	};
}

describe( 'createFloatingPanel', () => {
	beforeEach( () => {
		mockEditMode( 'edit' );
		__registerSlice( slice );
		__createStore();
	} );

	afterEach( () => {
		__deleteStore();
	} );

	it( 'registers the panel with defaults when no persisted state exists', () => {
		// Arrange.
		sync( memoryStorage() );

		// Act.
		createFloatingPanel( declaration );

		// Assert.
		const state = selectPanelState( __getState(), declaration.id );
		expect( state ).toMatchObject( {
			isOpen: false,
			size: { inlineSize: 320, blockSize: 480 },
		} );
	} );

	it( 'registers isDraggable in the store', () => {
		// Arrange.
		sync( memoryStorage() );

		// Act.
		createFloatingPanel( { ...declaration, isDraggable: true } );

		// Assert.
		expect( selectIsDraggable( __getState(), declaration.id ) ).toBe( true );
	} );

	it( 'defaults isDraggable to false when not provided', () => {
		// Arrange.
		sync( memoryStorage() );

		// Act.
		createFloatingPanel( declaration );

		// Assert.
		expect( selectIsDraggable( __getState(), declaration.id ) ).toBe( false );
	} );

	it( 'registers isResizable in the store', () => {
		// Arrange.
		sync( memoryStorage() );

		// Act.
		createFloatingPanel( { ...declaration, isResizable: true } );

		// Assert.
		expect( selectIsResizable( __getState(), declaration.id ) ).toBe( true );
	} );

	it( 'defaults isResizable to false when not provided', () => {
		// Arrange.
		sync( memoryStorage() );

		// Act.
		createFloatingPanel( declaration );

		// Assert.
		expect( selectIsResizable( __getState(), declaration.id ) ).toBe( false );
	} );

	it( 'rehydrates from persisted state when present', () => {
		// Arrange.
		const persisted: FloatingPanelState = {
			isOpen: true,
			position: { insetInlineStart: 600, insetBlockStart: 240 },
			size: { inlineSize: 400, blockSize: 520 },
			zIndex: 5,
		};
		sync( memoryStorage( encodePersistedState( { [ declaration.id ]: persisted } ) ) );

		// Act.
		createFloatingPanel( declaration );

		// Assert.
		expect( selectPanelState( __getState(), declaration.id ) ).toEqual( persisted );
	} );

	it( 'toggle closes an open panel and opens a closed one', () => {
		// Arrange.
		sync( memoryStorage() );
		const { useFloatingPanelStatus, useFloatingPanelActions } = createFloatingPanel( declaration );

		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<StoreProvider store={ store }>{ children }</StoreProvider>
		);

		const { result } = renderHook(
			() => ( {
				status: useFloatingPanelStatus(),
				actions: useFloatingPanelActions(),
			} ),
			{ wrapper }
		);

		// Assert — initial closed.
		expect( result.current.status.isOpen ).toBe( false );

		// Act — open via toggle.
		act( () => result.current.actions.toggle() );

		// Assert.
		expect( result.current.status.isOpen ).toBe( true );

		// Act — close via toggle.
		act( () => result.current.actions.toggle() );

		// Assert.
		expect( result.current.status.isOpen ).toBe( false );
	} );

	it( 'host does not render a closed panel even when injected', () => {
		// Arrange.
		const mock = createFloatingPanel( declaration );
		registerFloatingPanel( mock.panel );

		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store not initialized' );
		}

		// Act.
		renderWithTheme(
			<StoreProvider store={ store }>
				<FloatingPanelsHost />
			</StoreProvider>
		);

		// Assert.
		expect( screen.queryByText( 'Body content' ) ).not.toBeInTheDocument();
	} );

	it( 'opens and closes a registered panel via the actions hook', () => {
		// Arrange.
		const MockPanelComponent: ComponentType = () => (
			<>
				<FloatingPanelHeader panelId={ declaration.id } title="Audit" />
				<FloatingPanelBody>Body content</FloatingPanelBody>
			</>
		);

		const mock = createFloatingPanel( { ...declaration, component: MockPanelComponent } );
		registerFloatingPanel( mock.panel );

		const OpenCloseButtons = () => {
			const { open, close } = mock.useFloatingPanelActions();

			return (
				<>
					<button onClick={ open }>Open</button>
					<button onClick={ close }>Close</button>
				</>
			);
		};

		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store not initialized' );
		}

		renderWithTheme(
			<StoreProvider store={ store }>
				<OpenCloseButtons />
				<FloatingPanelsHost />
			</StoreProvider>
		);

		// Act — open.
		fireEvent.click( screen.getByText( 'Open' ) );

		// Assert.
		expect( screen.getByText( 'Body content' ) ).toBeInTheDocument();

		// Act — close.
		fireEvent.click( screen.getByText( 'Close' ) );

		// Assert.
		expect( screen.queryByText( 'Body content' ) ).not.toBeInTheDocument();
	} );
} );
