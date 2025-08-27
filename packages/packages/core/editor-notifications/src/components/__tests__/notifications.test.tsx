/* eslint-disable testing-library/no-node-access */
import * as React from 'react';
import { type ReactNode } from 'react';
import { closeSnackbar, SnackbarProvider } from 'notistack';
import {
	__createStore,
	__deleteStore,
	__registerSlice,
	__StoreProvider as Provider,
	type Store,
} from '@elementor/store';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';

import { notificationsSlice } from '../../slice';
import { type NotificationData } from '../../types';
import Wrapper, { notify, NotifyReact } from '../notifications';

let enqueuedSnackbar: {
	message: string;
	options: Record< string, unknown > & {
		key: string;
		action: ReactNode;
	};
}[] = [];

jest.mock( 'notistack', () => {
	return {
		...jest.requireActual( 'notistack' ),
		useSnackbar: jest.fn().mockReturnValue( {
			enqueueSnackbar: jest.fn().mockImplementation( ( message, options ) => {
				enqueuedSnackbar.push( { message, options } );
			} ),
		} ),
		closeSnackbar: jest.fn().mockImplementation( ( key ) => {
			const index = enqueuedSnackbar.findIndex( ( snackbar ) => snackbar.options.key === key );

			if ( index !== -1 ) {
				enqueuedSnackbar.splice( index, 1 );
			}
		} ),
	};
} );

describe( 'Notifications', () => {
	let store: Store;

	beforeEach( () => {
		__registerSlice( notificationsSlice );
		store = __createStore();
	} );

	afterEach( async () => {
		__deleteStore();
		enqueuedSnackbar = [];
	} );

	it( 'should enqueue snackbar on notify react', async () => {
		// Arrange.
		render(
			<Provider store={ store }>
				<SnackbarProvider>
					<Wrapper />
				</SnackbarProvider>
			</Provider>
		);

		const snackbarOpts = {
			id: '1',
			message: 'Test Notification 1',
			type: 'info',
			additionalActionProps: [],
		};

		// Act.
		renderHook( () => NotifyReact( snackbarOpts as NotificationData ), {
			wrapper: ( { children } ) => (
				<Provider store={ store }>
					<SnackbarProvider>{ children }</SnackbarProvider>
				</Provider>
			),
		} );

		// Assert.
		expect( enqueuedSnackbar ).toHaveLength( 1 );
		expect( enqueuedSnackbar[ 0 ].message ).toBe( 'Test Notification 1' );
		expect( enqueuedSnackbar[ 0 ].options.key ).toBe( snackbarOpts.id );
		expect( enqueuedSnackbar[ 0 ].options.variant ).toBe( snackbarOpts.type );
		expect( enqueuedSnackbar[ 0 ].options.action ).toBeInstanceOf( Object );

		const state = store.getState();

		expect( state.notifications ).toEqual( {
			1: {
				id: '1',
				message: 'Test Notification 1',
				type: 'info',
				additionalActionProps: [],
			},
		} );
	} );

	it( 'should enqueue snackbar on notify JS', async () => {
		// Arrange.
		render(
			<Provider store={ store }>
				<SnackbarProvider>
					<Wrapper />
				</SnackbarProvider>
			</Provider>
		);

		const snackbarOpts = {
			id: '1',
			message: 'Test Notification 1',
			type: 'info',
			additionalActionProps: [],
		};

		// Act.
		act( () => {
			notify( snackbarOpts as NotificationData );
		} );

		// Assert.
		expect( enqueuedSnackbar[ 0 ].message ).toBe( 'Test Notification 1' );
		expect( enqueuedSnackbar[ 0 ].options.key ).toBe( snackbarOpts.id );
		expect( enqueuedSnackbar[ 0 ].options.variant ).toBe( snackbarOpts.type );
		expect( enqueuedSnackbar[ 0 ].options.action ).toBeInstanceOf( Object );

		const state = store.getState();

		expect( state.notifications ).toEqual( {
			1: {
				id: '1',
				message: 'Test Notification 1',
				type: 'info',
				additionalActionProps: [],
			},
		} );
	} );

	it( 'should clear snackbar on click close button', async () => {
		// Arrange.
		render(
			<Provider store={ store }>
				<SnackbarProvider>
					<Wrapper />
				</SnackbarProvider>
			</Provider>
		);

		const snackbarOpts = {
			id: '1',
			message: 'Test Notification 1',
			type: 'info',
			additionalActionProps: [],
		};

		// Act.
		act( () => {
			notify( snackbarOpts as NotificationData );
		} );

		// Assert.
		await waitFor( () => {
			expect( enqueuedSnackbar ).toHaveLength( 1 );
		} );

		// Act.
		const Component = enqueuedSnackbar[ 0 ].options.action;

		render( Component );

		const dismissButton = screen.getByRole( 'button', { name: 'close' } );

		// Assert.
		expect( dismissButton ).toBeInTheDocument();

		let state = store.getState();

		expect( state.notifications ).toEqual( {
			1: {
				id: '1',
				message: 'Test Notification 1',
				type: 'info',
				additionalActionProps: [],
			},
		} );

		// Act.
		act( () => {
			dismissButton.click();
		} );

		state = store.getState();

		// Assert.
		await waitFor( () => {
			expect( closeSnackbar ).toHaveBeenCalledWith( '1' );
		} );

		expect( enqueuedSnackbar ).toHaveLength( 0 );

		expect( state.notifications ).toEqual( {} );
	} );

	it( 'should not notify duplicate notifications', async () => {
		// Arrange.
		render(
			<Provider store={ store }>
				<SnackbarProvider>
					<Wrapper />
				</SnackbarProvider>
			</Provider>
		);

		const snackbarOpts = {
			id: '1',
			message: 'Test Notification 1',
			type: 'info',
			additionalActionProps: [],
		};

		// Act.
		act( () => {
			notify( snackbarOpts as NotificationData );
		} );

		// Assert.
		await waitFor( () => {
			expect( Array.from( Object.keys( store.getState().notifications ) ).length ).toBe( 1 );
		} );

		// Act.
		act( () => {
			notify( snackbarOpts as NotificationData );
		} );

		// Assert.
		await waitFor( () => {
			expect( Array.from( Object.keys( store.getState().notifications ) ).length ).toBe( 1 );
		} );
	} );

	it( 'should add snackbar with additional action buttons', async () => {
		// Arrange.
		render(
			<Provider store={ store }>
				<SnackbarProvider>
					<Wrapper />
				</SnackbarProvider>
			</Provider>
		);

		const snackbarOpts = {
			id: '1',
			message: 'Test Notification 1',
			type: 'info',
			additionalActionProps: [
				{
					children: 'Test Button 1',
				},
				{
					children: 'Test Button 2',
				},
			],
		};

		// Act.
		act( () => {
			notify( snackbarOpts as NotificationData );
		} );

		// Assert.
		await waitFor( () => {
			expect( enqueuedSnackbar ).toHaveLength( 1 );
		} );

		expect( enqueuedSnackbar[ 0 ].options.action ).toBeInstanceOf( Object );

		// Act.
		const Component = enqueuedSnackbar[ 0 ].options.action;

		render( Component );

		const additionalButtons = screen.getAllByRole( 'button', { name: /Test Button/i } );

		// Assert.
		expect( additionalButtons ).toHaveLength( 2 );
		expect( additionalButtons[ 0 ] ).toHaveTextContent( snackbarOpts.additionalActionProps[ 0 ].children );
		expect( additionalButtons[ 1 ] ).toHaveTextContent( snackbarOpts.additionalActionProps[ 1 ].children );
	} );
} );
