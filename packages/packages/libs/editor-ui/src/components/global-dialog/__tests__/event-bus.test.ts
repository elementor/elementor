import * as React from 'react';
import { waitFor } from '@testing-library/react';

import {
	closeDialog,
	type DialogContent,
	type DialogStateCallback,
	openDialog,
	subscribeToDialogState,
} from '../event-bus';

describe( 'EventBus', () => {
	// Clean up state after each test
	afterEach( () => {
		closeDialog();
	} );

	it( 'should update state when openDialog is called', async () => {
		// Arrange
		const callback = jest.fn();
		const testComponent = React.createElement( 'div', { children: 'Test' } );
		const dialogContent: DialogContent = { component: testComponent };

		subscribeToDialogState( callback );
		callback.mockClear(); // Clear the initial call

		// Act
		openDialog( dialogContent );

		// Assert
		await waitFor( () => {
			expect( callback ).toHaveBeenCalledWith( { component: testComponent } );
		} );
		await waitFor( () => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	it( 'should reset state to null when closeDialog is called', async () => {
		// Arrange
		const callback = jest.fn();
		const testComponent = React.createElement( 'div', { children: 'Test' } );

		subscribeToDialogState( callback );
		openDialog( { component: testComponent } );

		// Wait for the openDialog to complete
		await waitFor( () => {
			expect( callback ).toHaveBeenCalledWith( { component: testComponent } );
		} );

		callback.mockClear(); // Clear previous calls

		// Act
		closeDialog();

		// Assert
		await waitFor( () => {
			expect( callback ).toHaveBeenCalledWith( null );
		} );
		await waitFor( () => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	it( 'should call callback immediately with current state on subscription', () => {
		// Arrange
		const testComponent = React.createElement( 'div', { children: 'Test' } );
		openDialog( { component: testComponent } );

		const callback = jest.fn();

		// Act
		subscribeToDialogState( callback );

		// Assert
		expect( callback ).toHaveBeenCalledWith( { component: testComponent } );
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should unsubscribe callback when unsubscribe function is called', () => {
		// Arrange
		const callback = jest.fn();
		const testComponent = React.createElement( 'div', { children: 'Test' } );

		const unsubscribe = subscribeToDialogState( callback );
		callback.mockClear(); // Clear initial call

		// Act
		unsubscribe();
		openDialog( { component: testComponent } );

		// Assert
		expect( callback ).not.toHaveBeenCalled();
	} );
} );
