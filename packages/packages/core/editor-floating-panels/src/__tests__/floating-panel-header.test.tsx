import * as React from 'react';
import { type ComponentType } from 'react';
import { renderWithTheme } from 'test-utils';
import {
	__createStore,
	__deleteStore,
	__dispatch,
	__getStore,
	__registerSlice,
	__StoreProvider as StoreProvider,
} from '@elementor/store';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import FloatingPanelHeader from '../components/external/floating-panel-header';
import { slice } from '../store/slice';
import { mockEditMode } from './mock-edit-mode';

const PANEL_ID = 'test-panel';

const MockActionIcon: ComponentType = () => <svg aria-hidden="true" />;

function renderHeader( props: Partial< React.ComponentProps< typeof FloatingPanelHeader > > = {} ) {
	const store = __getStore();

	if ( ! store ) {
		throw new Error( 'Store not initialized' );
	}

	return renderWithTheme(
		<StoreProvider store={ store }>
			<FloatingPanelHeader panelId={ PANEL_ID } title="Test Panel" { ...props } />
		</StoreProvider>
	);
}

describe( 'FloatingPanelHeader', () => {
	beforeEach( () => {
		mockEditMode( 'edit' );
		__registerSlice( slice );
		__createStore();
		__dispatch(
			slice.actions.register( {
				id: PANEL_ID,
				isDraggable: true,
				defaults: {
					width: 320,
					height: 480,
					minWidth: 240,
					minHeight: 320,
				},
			} )
		);
	} );

	afterEach( () => {
		__deleteStore();
	} );

	it( 'renders header actions with accessible labels', () => {
		renderHeader( {
			actions: [
				{
					id: 'test-action',
					icon: MockActionIcon,
					label: 'Test action',
				},
			],
		} );

		expect( screen.getByRole( 'button', { name: 'Test action' } ) ).toBeInTheDocument();
	} );

	it( 'shows a tooltip for an action label on hover', async () => {
		renderHeader( {
			actions: [
				{
					id: 'test-action',
					icon: MockActionIcon,
					label: 'Coming soon',
				},
			],
		} );

		fireEvent.mouseOver( screen.getByRole( 'button', { name: 'Coming soon' } ) );

		await waitFor( () => {
			expect( screen.getByRole( 'tooltip' ) ).toHaveTextContent( 'Coming soon' );
		} );
	} );

	it( 'does not invoke onClick when a disabled action is clicked', () => {
		const onClick = jest.fn();

		renderHeader( {
			actions: [
				{
					id: 'disabled-action',
					icon: MockActionIcon,
					label: 'Coming soon',
					disabled: true,
					onClick,
				},
			],
		} );

		const actionButton = screen.getByRole( 'button', { name: 'Coming soon' } );

		expect( actionButton ).toBeDisabled();

		fireEvent.click( actionButton );

		expect( onClick ).not.toHaveBeenCalled();
	} );

	it( 'invokes onClick when an enabled action is clicked', () => {
		const onClick = jest.fn();

		renderHeader( {
			actions: [
				{
					id: 'enabled-action',
					icon: MockActionIcon,
					label: 'Run action',
					onClick,
				},
			],
		} );

		fireEvent.click( screen.getByRole( 'button', { name: 'Run action' } ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders drag handle when isDraggable is true', () => {
		renderHeader();

		expect( screen.getByRole( 'toolbar', { name: /drag to reposition/i } ) ).toBeInTheDocument();
	} );

	it( 'does not render drag handle when isDraggable is false', () => {
		__deleteStore();
		__registerSlice( slice );
		__createStore();
		__dispatch(
			slice.actions.register( {
				id: PANEL_ID,
				isDraggable: false,
				defaults: {
					width: 320,
					height: 480,
					minWidth: 240,
					minHeight: 320,
				},
			} )
		);

		renderHeader();

		expect( screen.queryByRole( 'toolbar', { name: /drag to reposition/i } ) ).not.toBeInTheDocument();
	} );
} );
