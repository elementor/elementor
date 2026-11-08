import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import {
	__createStore,
	__deleteStore,
	__dispatch,
	__getStore,
	__registerSlice,
	__StoreProvider as StoreProvider,
} from '@elementor/store';
import { act, screen } from '@testing-library/react';

import FloatingPanelsHost from '../components/internal/host';
import { DOCKED_BODY_CLASS, DOCKED_WIDTH_VAR } from '../hooks/use-docked-layout';
import { injectIntoFloatingPanels } from '../location';
import { slice } from '../store/slice';
import { mockEditMode } from './mock-edit-mode';

describe( 'FloatingPanelsHost', () => {
	beforeEach( () => {
		mockEditMode( 'edit' );
		__registerSlice( slice );
		__createStore();
	} );

	afterEach( () => {
		__deleteStore();
	} );

	it( 'keeps an open panel visible in edit mode', () => {
		// Arrange.
		mockEditMode( 'edit' );
		const PanelA = () => <div>Panel A body</div>;

		injectIntoFloatingPanels( { id: 'a', component: PanelA } );

		__dispatch(
			slice.actions.register( {
				id: 'a',
				defaults: {
					width: 200,
					height: 300,
					minWidth: 100,
					minHeight: 100,
					corner: 'block-start-inline-start',
				},
			} )
		);
		__dispatch( slice.actions.open( 'a' ) );

		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store not initialized' );
		}

		renderWithTheme(
			<StoreProvider store={ store }>
				<FloatingPanelsHost />
			</StoreProvider>
		);

		// Assert.
		expect( screen.getByText( 'Panel A body' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'complementary' ) ).not.toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'hides an open panel in preview mode', () => {
		// Arrange.
		mockEditMode( 'preview' );
		const PanelA = () => <div>Panel A body</div>;

		injectIntoFloatingPanels( { id: 'a', component: PanelA } );

		__dispatch(
			slice.actions.register( {
				id: 'a',
				defaults: {
					width: 200,
					height: 300,
					minWidth: 100,
					minHeight: 100,
					corner: 'block-start-inline-start',
				},
			} )
		);
		__dispatch( slice.actions.open( 'a' ) );

		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store not initialized' );
		}

		renderWithTheme(
			<StoreProvider store={ store }>
				<FloatingPanelsHost />
			</StoreProvider>
		);

		// Assert.
		const panel = screen.getByRole( 'complementary', { hidden: true } );

		expect( panel ).toHaveTextContent( 'Panel A body' );
		expect( panel ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'keeps a keepMounted panel mounted, with the same iframe, after close', () => {
		// Arrange.
		const PanelA = () => <iframe title="Angie session" />;

		injectIntoFloatingPanels( { id: 'a', component: PanelA, keepMounted: true } );

		__dispatch(
			slice.actions.register( {
				id: 'a',
				defaults: {
					width: 200,
					height: 300,
					minWidth: 100,
					minHeight: 100,
					corner: 'block-start-inline-start',
				},
			} )
		);
		__dispatch( slice.actions.open( 'a' ) );

		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store not initialized' );
		}

		renderWithTheme(
			<StoreProvider store={ store }>
				<FloatingPanelsHost />
			</StoreProvider>
		);

		const iframe = screen.getByTitle( 'Angie session' );

		// Act.
		act( () => {
			__dispatch( slice.actions.close( 'a' ) );
		} );

		// Assert.
		expect( screen.getByTitle( 'Angie session' ) ).toBe( iframe );
		expect( screen.getByRole( 'complementary', { hidden: true } ) ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'unmounts a panel that is not keepMounted when it closes', () => {
		// Arrange.
		const PanelA = () => <iframe title="Audit session" />;

		injectIntoFloatingPanels( { id: 'a', component: PanelA } );

		__dispatch(
			slice.actions.register( {
				id: 'a',
				defaults: {
					width: 200,
					height: 300,
					minWidth: 100,
					minHeight: 100,
					corner: 'block-start-inline-start',
				},
			} )
		);
		__dispatch( slice.actions.open( 'a' ) );

		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store not initialized' );
		}

		renderWithTheme(
			<StoreProvider store={ store }>
				<FloatingPanelsHost />
			</StoreProvider>
		);

		// Act.
		act( () => {
			__dispatch( slice.actions.close( 'a' ) );
		} );

		// Assert.
		expect( screen.queryByTitle( 'Audit session' ) ).not.toBeInTheDocument();
	} );

	it( 'pins an open docked panel to the canvas edge and releases the width on close', () => {
		// Arrange.
		const PanelA = () => <div>Docked body</div>;

		injectIntoFloatingPanels( { id: 'docked', component: PanelA, keepMounted: true } );

		__dispatch(
			slice.actions.register( {
				id: 'docked',
				isDocked: true,
				defaults: {
					width: 400,
					height: 720,
					minWidth: 320,
					minHeight: 480,
					corner: 'block-start-inline-end',
				},
			} )
		);
		__dispatch( slice.actions.open( 'docked' ) );

		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store not initialized' );
		}

		renderWithTheme(
			<StoreProvider store={ store }>
				<FloatingPanelsHost />
			</StoreProvider>
		);

		const panel = screen.getByRole( 'complementary' );

		// Assert.
		expect( document.body ).toHaveClass( DOCKED_BODY_CLASS );
		expect( document.body.style.getPropertyValue( DOCKED_WIDTH_VAR ) ).toBe( '400px' );
		expect( panel ).toHaveAttribute( 'data-docked', 'true' );
		// eslint-disable-next-line testing-library/no-node-access
		expect( panel.querySelectorAll( '[data-resize-edge="inline-start"]' ) ).toHaveLength( 1 );
		// eslint-disable-next-line testing-library/no-node-access
		expect( panel.querySelectorAll( '[data-resize-edge], [data-resize-corner]' ) ).toHaveLength( 1 );

		// Act.
		act( () => {
			__dispatch( slice.actions.close( 'docked' ) );
		} );

		// Assert.
		expect( document.body ).not.toHaveClass( DOCKED_BODY_CLASS );
		expect( document.body.style.getPropertyValue( DOCKED_WIDTH_VAR ) ).toBe( '' );
		expect( screen.getByText( 'Docked body' ) ).toBeInTheDocument();
	} );
} );
