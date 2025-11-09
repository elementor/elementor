import * as React from 'react';
import { TrashIcon } from '@elementor/icons';
import { type IconButtonProps, type MenuItemProps, type MenuProps } from '@elementor/ui';
import { fireEvent, render, screen } from '@testing-library/react';

import { VariableEditMenu } from '../ui/variable-edit-menu';

const mockPopupState = {
	isOpen: false,
	anchorEl: null,
	close: jest.fn(),
	open: jest.fn(),
	setAnchorEl: jest.fn(),
	toggle: jest.fn(),
};

const mockTriggerProps = {
	'aria-controls': 'menu',
	'aria-haspopup': true,
	onClick: jest.fn(),
};

const mockMenuProps = {
	anchorEl: null,
	onClose: jest.fn(),
};

jest.mock( '@elementor/ui', () => ( {
	...jest.requireActual( '@elementor/ui' ),
	IconButton: ( props: IconButtonProps ) => (
		<button { ...props } aria-label="Menu trigger">
			{ props.children }
		</button>
	),
	Menu: ( {
		children,
		open,
		MenuListProps,
		PaperProps,
		disablePortal,
		anchorEl,
		anchorOrigin,
		transformOrigin,
		...props
	}: MenuProps ) =>
		open && (
			<div
				role="menu"
				data-menu-props={ JSON.stringify( {
					MenuListProps,
					PaperProps,
					disablePortal,
					anchorEl,
					anchorOrigin,
					transformOrigin,
				} ) }
				{ ...props }
			>
				{ children }
			</div>
		),
	MenuItem: ( { children, sx, ...props }: MenuItemProps ) => (
		<li role="menuitem" data-sx={ JSON.stringify( sx ) } { ...props }>
			{ children }
		</li>
	),
	usePopupState: () => mockPopupState,
	bindTrigger: () => mockTriggerProps,
	bindMenu: () => mockMenuProps,
} ) );

describe( 'VariableEditMenu', () => {
	const mockMenuActions = [
		{
			name: 'Delete',
			icon: TrashIcon,
			color: 'error.main',
			onClick: jest.fn(),
		},
	];

	const renderComponent = ( props = {} ) => {
		const defaultProps = {
			menuActions: mockMenuActions,
			itemId: '123',
		};

		return render( <VariableEditMenu { ...defaultProps } { ...props } /> );
	};

	beforeEach( () => {
		jest.clearAllMocks();
		Object.assign( mockPopupState, {
			isOpen: false,
			anchorEl: null,
			close: jest.fn(),
			open: jest.fn(),
			setAnchorEl: jest.fn(),
			toggle: jest.fn(),
		} );
	} );

	it( 'should render menu trigger button', () => {
		// Arrange & Act
		renderComponent();

		// Assert
		expect( screen.getByRole( 'button', { name: 'Menu trigger' } ) ).toBeInTheDocument();
	} );

	it( 'should render menu items when menu is open', () => {
		// Arrange
		Object.assign( mockPopupState, {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
		} );

		// Act
		renderComponent();

		// Assert
		expect( screen.getByRole( 'menu' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
	} );

	it( 'should handle disabled state', () => {
		// Arrange & Act
		renderComponent( { disabled: true } );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Menu trigger' } ) ).toBeDisabled();
	} );

	it( 'should call action onClick when menu item is clicked', () => {
		// Arrange
		const mockClose = jest.fn();
		Object.assign( mockPopupState, {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
			close: mockClose,
		} );
		renderComponent();

		// Act
		fireEvent.click( screen.getByRole( 'menuitem' ) );

		// Assert
		expect( mockMenuActions[ 0 ].onClick ).toHaveBeenCalled();
		expect( mockClose ).toHaveBeenCalled();
	} );

	it( 'should apply correct styles to menu items', () => {
		// Arrange
		Object.assign( mockPopupState, {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
		} );

		// Act
		renderComponent();
		const menuItem = screen.getByRole( 'menuitem' );
		const sx = JSON.parse( menuItem.getAttribute( 'data-sx' ) || '{}' );

		// Assert
		expect( sx ).toEqual( {
			color: 'error.main',
			gap: 1,
		} );
	} );

	it( 'should render multiple menu items', () => {
		// Arrange
		Object.assign( mockPopupState, {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
		} );

		const multipleActions = [
			...mockMenuActions,
			{
				name: 'Edit',
				icon: TrashIcon,
				color: 'primary.main',
				onClick: jest.fn(),
			},
		];

		// Act
		renderComponent( { menuActions: multipleActions } );

		// Assert
		expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Edit' ) ).toBeInTheDocument();
	} );

	it( 'should apply custom colors to menu items', () => {
		// Arrange
		Object.assign( mockPopupState, {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
		} );

		const customColorActions = [
			{
				name: 'Custom Action',
				icon: TrashIcon,
				color: 'success.main',
				onClick: jest.fn(),
			},
		];

		// Act
		renderComponent( { menuActions: customColorActions } );
		const menuItem = screen.getByRole( 'menuitem' );
		const sx = JSON.parse( menuItem.getAttribute( 'data-sx' ) || '{}' );

		// Assert
		expect( sx ).toEqual( {
			color: 'success.main',
			gap: 1,
		} );
		expect( screen.getByText( 'Custom Action' ) ).toBeInTheDocument();
	} );
} );
