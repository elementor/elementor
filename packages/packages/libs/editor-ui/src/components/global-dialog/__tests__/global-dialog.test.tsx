import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { GlobalDialog } from '../components/global-dialog';
import { closeDialog, type DialogStateCallback, openDialog } from '../subscribers';

// Get mock functions for cleanup
const mockEventBus = jest.requireMock( '../event-bus' );

jest.mock( '../event-bus', () => {
	let currentState: { component: React.ReactElement } | null = null;
	const subscribers = new Set< DialogStateCallback >();

	const notifySubscribers = () => {
		subscribers.forEach( ( callback ) => callback( currentState ) );
	};

	return {
		subscribeToDialogState: jest.fn( ( callback: DialogStateCallback ) => {
			subscribers.add( callback );
			// Call callback immediately with current state (matches real implementation)
			callback( currentState );
			return () => subscribers.delete( callback );
		} ),
		openDialog: jest.fn( ( { component }: { component: React.ReactElement } ) => {
			currentState = { component };
			// Notify synchronously (matches real implementation)
			notifySubscribers();
		} ),
		closeDialog: jest.fn( () => {
			currentState = null;
			// Notify synchronously (matches real implementation)
			notifySubscribers();
		} ),
		// For manual control in tests
		__notifySubscribers: notifySubscribers,
		__getCurrentState: () => currentState,
		__getSubscribers: () => subscribers,
		__reset: () => {
			currentState = null;
			subscribers.clear();
		},
	};
} );

// Helper function to render GlobalDialog
const renderGlobalDialog = () => {
	return render( <GlobalDialog /> );
};

describe( 'GlobalDialog', () => {
	// Reset dialog state before each test to avoid test interference
	beforeEach( () => {
		mockEventBus.__reset();
	} );

	afterEach( () => {
		// Clean up any open dialogs after each test
		mockEventBus.__reset();
	} );

	it( 'should not render anything when no dialog is open', () => {
		// Act
		renderGlobalDialog();

		// Assert
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	it( 'should render dialog when openDialog is called', async () => {
		// Arrange
		const TestDialogContent = () => <div>Test Dialog Content</div>;

		renderGlobalDialog();

		// Act
		act( () => {
			openDialog( { component: <TestDialogContent /> } );
		} );

		// Assert - Wait for the dialog to appear
		await waitFor( () => {
			expect( screen.getAllByRole( 'dialog' ) ).toHaveLength( 2 ); // MUI creates 2 dialog elements
		} );
		expect( screen.getByText( 'Test Dialog Content' ) ).toBeInTheDocument();
	} );

	it( 'should close dialog when closeDialog is called', async () => {
		// Arrange
		const TestDialogContent = () => <div>Test Dialog Content</div>;

		renderGlobalDialog();

		// Open dialog first
		act( () => {
			openDialog( { component: <TestDialogContent /> } );
		} );

		await waitFor( () => {
			expect( screen.getAllByRole( 'dialog' ) ).toHaveLength( 2 );
		} );

		// Act
		act( () => {
			closeDialog();
		} );

		// Assert
		await waitFor( () => {
			expect( screen.queryAllByRole( 'dialog' ) ).toHaveLength( 0 );
		} );
		expect( screen.queryByText( 'Test Dialog Content' ) ).not.toBeInTheDocument();
	} );

	it( 'should close dialog when Dialog onClose is triggered', async () => {
		// Arrange
		const TestDialogContent = () => <div>Test Dialog Content</div>;

		renderGlobalDialog();

		// Open dialog first
		act( () => {
			openDialog( { component: <TestDialogContent /> } );
		} );

		await waitFor( () => {
			expect( screen.getAllByRole( 'dialog' ) ).toHaveLength( 2 );
		} );
		expect( screen.getByText( 'Test Dialog Content' ) ).toBeInTheDocument();

		// Act - Simulate Dialog's onClose being called (like when user clicks close button)
		act( () => {
			closeDialog();
		} );

		// Assert
		await waitFor( () => {
			expect( screen.queryAllByRole( 'dialog' ) ).toHaveLength( 0 );
		} );
		expect( screen.queryByText( 'Test Dialog Content' ) ).not.toBeInTheDocument();
	} );

	it( 'should handle null/undefined dialog content gracefully', () => {
		// This test ensures the component doesn't crash with invalid content
		renderGlobalDialog();

		// No dialog should be rendered when content is null
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
	it( 'should replace dialog content when a new dialog is opened', async () => {
		// Arrange
		const FirstDialogContent = () => <div>First Dialog</div>;
		const SecondDialogContent = () => <div>Second Dialog</div>;

		renderGlobalDialog();

		// Open first dialog
		act( () => {
			openDialog( { component: <FirstDialogContent /> } );
		} );

		await waitFor( () => {
			expect( screen.getByText( 'First Dialog' ) ).toBeInTheDocument();
		} );

		// Act - Open second dialog
		act( () => {
			openDialog( { component: <SecondDialogContent /> } );
		} );

		// Assert
		await waitFor( () => {
			expect( screen.queryByText( 'First Dialog' ) ).not.toBeInTheDocument();
		} );
		expect( screen.getByText( 'Second Dialog' ) ).toBeInTheDocument();
	} );

	it( 'should subscribe to dialog state on mount', async () => {
		// Arrange
		const TestDialogContent = () => <div>Test Content</div>;

		// Act
		renderGlobalDialog();

		// The component should be subscribed, so opening a dialog should work
		act( () => {
			openDialog( { component: <TestDialogContent /> } );
		} );

		// Assert
		await waitFor( () => {
			expect( screen.getAllByRole( 'dialog' ) ).toHaveLength( 2 );
		} );
	} );

	it( 'should clean up subscription when component unmounts', async () => {
		// Arrange
		const TestDialogContent = () => <div>Test Dialog</div>;

		const view = render( <GlobalDialog /> );
		const unmount = view.unmount;

		// Open dialog to verify subscription is working
		act( () => {
			openDialog( { component: <TestDialogContent /> } );
		} );

		await waitFor( () => {
			expect( screen.getAllByRole( 'dialog' ) ).toHaveLength( 2 );
		} );

		// Act - Unmount component
		unmount();

		// Try to open dialog again - should not affect the unmounted component
		act( () => {
			openDialog( { component: <TestDialogContent /> } );
		} );

		// Assert - No dialog should be rendered since component is unmounted
		expect( screen.queryAllByRole( 'dialog' ) ).toHaveLength( 0 );
	} );
	it( 'should work with store dispatch patterns like error dialogs', async () => {
		// Arrange - Simulate error dialog pattern from editor-global-classes
		const ErrorDialogContent = ( {
			modifiedLabels,
		}: {
			modifiedLabels: Array< { original: string; modified: string; id: string } >;
		} ) => (
			<div>
				<h3>Duplicate Labels Found</h3>
				<ul>
					{ modifiedLabels.map( ( label ) => (
						<li key={ label.id }>
							{ label.original } → { label.modified }
						</li>
					) ) }
				</ul>
				<button onClick={ () => closeDialog() }>Close</button>
			</div>
		);

		const mockModifiedLabels = [
			{ original: 'MyClass', modified: 'DUP_MyClass', id: 'class-1' },
			{ original: 'Button', modified: 'DUP_Button', id: 'class-2' },
		];

		renderGlobalDialog();

		// Act - Simulate error dialog opening (like in show-error-dialog.tsx)
		act( () => {
			openDialog( {
				component: <ErrorDialogContent modifiedLabels={ mockModifiedLabels } />,
			} );
		} );

		// Assert
		await waitFor( () => {
			expect( screen.getAllByRole( 'dialog' ) ).toHaveLength( 2 );
		} );
		expect( screen.getByText( 'Duplicate Labels Found' ) ).toBeInTheDocument();
		expect( screen.getByText( 'MyClass → DUP_MyClass' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Button → DUP_Button' ) ).toBeInTheDocument();

		// Test closing
		fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

		await waitFor( () => {
			expect( screen.queryAllByRole( 'dialog' ) ).toHaveLength( 0 );
		} );
	} );
} );
