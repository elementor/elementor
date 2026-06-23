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
import { screen } from '@testing-library/react';

import FloatingPanelsHost from '../components/internal/host';
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
} );
