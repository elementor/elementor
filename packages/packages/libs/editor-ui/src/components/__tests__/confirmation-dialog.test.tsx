import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ConfirmationDialog } from '../confirmation-dialog';

describe( 'ConfirmationDialog', () => {
	const mockOnClose = jest.fn();
	const mockOnConfirm = jest.fn();
	const mockOnSuppressMessage = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render with title, content, and actions', () => {
		// Act
		render(
			<ConfirmationDialog open={ true } onClose={ mockOnClose }>
				<ConfirmationDialog.Title>Delete Item</ConfirmationDialog.Title>
				<ConfirmationDialog.Content>
					<ConfirmationDialog.ContentText>
						Are you sure you want to delete this item?
					</ConfirmationDialog.ContentText>
				</ConfirmationDialog.Content>
				<ConfirmationDialog.Actions
					onClose={ mockOnClose }
					onConfirm={ mockOnConfirm }
					cancelLabel="Cancel"
					confirmLabel="Delete"
				/>
			</ConfirmationDialog>
		);

		// Assert
		expect( screen.getByText( 'Delete Item' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Are you sure you want to delete this item?' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Delete' } ) ).toBeInTheDocument();
	} );

	it( 'should call onClose when cancel button is clicked', () => {
		// Arrange
		render(
			<ConfirmationDialog open={ true } onClose={ mockOnClose }>
				<ConfirmationDialog.Title>Confirm Action</ConfirmationDialog.Title>
				<ConfirmationDialog.Content>
					<ConfirmationDialog.ContentText>Are you sure?</ConfirmationDialog.ContentText>
				</ConfirmationDialog.Content>
				<ConfirmationDialog.Actions onClose={ mockOnClose } onConfirm={ mockOnConfirm } />
			</ConfirmationDialog>
		);

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Not now' } ) );

		// Assert
		expect( mockOnClose ).toHaveBeenCalledTimes( 1 );
		expect( mockOnConfirm ).not.toHaveBeenCalled();
	} );

	it( 'should call onConfirm when confirm button is clicked', () => {
		// Arrange
		render(
			<ConfirmationDialog open={ true } onClose={ mockOnClose }>
				<ConfirmationDialog.Title>Confirm Action</ConfirmationDialog.Title>
				<ConfirmationDialog.Content>
					<ConfirmationDialog.ContentText>Are you sure?</ConfirmationDialog.ContentText>
				</ConfirmationDialog.Content>
				<ConfirmationDialog.Actions onClose={ mockOnClose } onConfirm={ mockOnConfirm } />
			</ConfirmationDialog>
		);

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		// Assert
		expect( mockOnConfirm ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should render with custom icon and icon color', () => {
		// Arrange
		const CustomIcon = () => <span>Custom Icon</span>;

		// Act
		render(
			<ConfirmationDialog open={ true } onClose={ mockOnClose }>
				<ConfirmationDialog.Title icon={ CustomIcon } iconColor="primary">
					Custom Title
				</ConfirmationDialog.Title>
				<ConfirmationDialog.Content>
					<ConfirmationDialog.ContentText>Content</ConfirmationDialog.ContentText>
				</ConfirmationDialog.Content>
				<ConfirmationDialog.Actions onClose={ mockOnClose } onConfirm={ mockOnConfirm } />
			</ConfirmationDialog>
		);

		// Assert
		expect( screen.getByText( 'Custom Icon' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Custom Title' ) ).toBeInTheDocument();
	} );

	it( 'should render "Don\'t show again" checkbox when onSuppressMessage is provided', () => {
		// Act
		render(
			<ConfirmationDialog open={ true } onClose={ mockOnClose }>
				<ConfirmationDialog.Title>Confirm Action</ConfirmationDialog.Title>
				<ConfirmationDialog.Content>
					<ConfirmationDialog.ContentText>Are you sure?</ConfirmationDialog.ContentText>
				</ConfirmationDialog.Content>
				<ConfirmationDialog.Actions
					onClose={ mockOnClose }
					onConfirm={ mockOnConfirm }
					onSuppressMessage={ mockOnSuppressMessage }
				/>
			</ConfirmationDialog>
		);

		// Assert
		expect( screen.getByText( "Don't show this again" ) ).toBeInTheDocument();
		expect( screen.getByRole( 'checkbox' ) ).toBeInTheDocument();
	} );

	it( 'should call onSuppressMessage when checkbox is checked and confirm is clicked', () => {
		// Arrange
		render(
			<ConfirmationDialog open={ true } onClose={ mockOnClose }>
				<ConfirmationDialog.Title>Confirm Action</ConfirmationDialog.Title>
				<ConfirmationDialog.Content>
					<ConfirmationDialog.ContentText>Are you sure?</ConfirmationDialog.ContentText>
				</ConfirmationDialog.Content>
				<ConfirmationDialog.Actions
					onClose={ mockOnClose }
					onConfirm={ mockOnConfirm }
					onSuppressMessage={ mockOnSuppressMessage }
				/>
			</ConfirmationDialog>
		);

		// Act
		const checkbox = screen.getByRole( 'checkbox' );
		fireEvent.click( checkbox );
		fireEvent.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		// Assert
		expect( mockOnSuppressMessage ).toHaveBeenCalledTimes( 1 );
		expect( mockOnConfirm ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should render with custom button labels', () => {
		// Act
		render(
			<ConfirmationDialog open={ true } onClose={ mockOnClose }>
				<ConfirmationDialog.Title>Custom Labels</ConfirmationDialog.Title>
				<ConfirmationDialog.Content>
					<ConfirmationDialog.ContentText>Content</ConfirmationDialog.ContentText>
				</ConfirmationDialog.Content>
				<ConfirmationDialog.Actions
					onClose={ mockOnClose }
					onConfirm={ mockOnConfirm }
					cancelLabel="No thanks"
					confirmLabel="Yes, proceed"
				/>
			</ConfirmationDialog>
		);

		// Assert
		expect( screen.getByRole( 'button', { name: 'No thanks' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Yes, proceed' } ) ).toBeInTheDocument();
	} );

	it( 'should render with custom suppress label', () => {
		// Act
		render(
			<ConfirmationDialog open={ true } onClose={ mockOnClose }>
				<ConfirmationDialog.Title>Confirm Action</ConfirmationDialog.Title>
				<ConfirmationDialog.Content>
					<ConfirmationDialog.ContentText>Are you sure?</ConfirmationDialog.ContentText>
				</ConfirmationDialog.Content>
				<ConfirmationDialog.Actions
					onClose={ mockOnClose }
					onConfirm={ mockOnConfirm }
					onSuppressMessage={ mockOnSuppressMessage }
					suppressLabel="Don't ask me again"
				/>
			</ConfirmationDialog>
		);

		// Assert
		expect( screen.getByText( "Don't ask me again" ) ).toBeInTheDocument();
	} );

	it( 'should not render when open is false', () => {
		// Act
		render(
			<ConfirmationDialog open={ false } onClose={ mockOnClose }>
				<ConfirmationDialog.Title>Should Not Render</ConfirmationDialog.Title>
				<ConfirmationDialog.Content>
					<ConfirmationDialog.ContentText>Hidden Content</ConfirmationDialog.ContentText>
				</ConfirmationDialog.Content>
				<ConfirmationDialog.Actions onClose={ mockOnClose } onConfirm={ mockOnConfirm } />
			</ConfirmationDialog>
		);

		// Assert
		expect( screen.queryByText( 'Should Not Render' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );
