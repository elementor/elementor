import * as React from 'react';
import { TrashIcon } from '@elementor/icons';
import { type IconButtonProps, type MenuItemProps, type MenuProps } from '@elementor/ui';
import { fireEvent, render, screen } from '@testing-library/react';

import { VariableEditMenu } from '../variable-edit-menu';

jest.mock( '@elementor/ui', () => {
	const actual = jest.requireActual( '@elementor/ui' );
	return {
		...actual,
		IconButton: ( props: IconButtonProps ) => (
			<button { ...props } aria-label="Menu trigger">
				{ props.children }
			</button>
		),
		Menu: ( { children, open, MenuListProps, PaperProps, disablePortal, anchorEl, anchorOrigin, transformOrigin, ...props }: MenuProps ) =>
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
		usePopupState: () => ( {
			isOpen: false,
			anchorEl: null,
			close: jest.fn(),
			open: jest.fn(),
			setAnchorEl: jest.fn(),
			toggle: jest.fn(),
		} ),
		bindTrigger: () => ( {
			'aria-controls': 'menu',
			'aria-haspopup': true,
			onClick: jest.fn(),
		} ),
		bindMenu: () => ( {
			anchorEl: null,
			onClose: jest.fn(),
		} ),
	};
} );

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
		};

		return render( <VariableEditMenu { ...defaultProps } { ...props } /> );
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render trigger button', () => {
		renderComponent();

		expect( screen.getByRole( 'button', { name: 'Menu trigger' } ) ).toBeInTheDocument();
	} );

	it( 'should render menu items when menu is open', () => {
		jest.spyOn( require( '@elementor/ui' ), 'usePopupState' ).mockImplementation( () => ( {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
			close: jest.fn(),
			open: jest.fn(),
			setAnchorEl: jest.fn(),
			toggle: jest.fn(),
		} ) );

		renderComponent();

		expect( screen.getByRole( 'menu' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
	} );

	it( 'should handle disabled state', () => {
		renderComponent( { disabled: true } );

		expect( screen.getByRole( 'button', { name: 'Menu trigger' } ) ).toBeDisabled();
	} );

	it( 'should call action onClick when menu item is clicked', () => {
		const mockClose = jest.fn();
		jest.spyOn( require( '@elementor/ui' ), 'usePopupState' ).mockImplementation( () => ( {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
			close: mockClose,
			open: jest.fn(),
			setAnchorEl: jest.fn(),
			toggle: jest.fn(),
		} ) );

		renderComponent();

		const menuItem = screen.getByRole( 'menuitem' );
		fireEvent.click( menuItem );

		expect( mockMenuActions[ 0 ].onClick ).toHaveBeenCalled();
		expect( mockClose ).toHaveBeenCalled();
	} );

	it( 'should apply correct styles to menu items', () => {
		jest.spyOn( require( '@elementor/ui' ), 'usePopupState' ).mockImplementation( () => ( {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
			close: jest.fn(),
			open: jest.fn(),
			setAnchorEl: jest.fn(),
			toggle: jest.fn(),
		} ) );

		renderComponent();

		const menuItem = screen.getByRole( 'menuitem' );
		const sx = JSON.parse( menuItem.getAttribute( 'data-sx' ) || '{}' );

		expect( sx ).toEqual( {
			color: 'error.main',
			gap: 1,
		} );
	} );

	it( 'should render multiple menu items', () => {
		jest.spyOn( require( '@elementor/ui' ), 'usePopupState' ).mockImplementation( () => ( {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
			close: jest.fn(),
			open: jest.fn(),
			setAnchorEl: jest.fn(),
			toggle: jest.fn(),
		} ) );

		const multipleActions = [
			...mockMenuActions,
			{
				name: 'Edit',
				icon: TrashIcon,
				color: 'primary.main',
				onClick: jest.fn(),
			},
		];

		renderComponent( { menuActions: multipleActions } );

		expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Edit' ) ).toBeInTheDocument();
	} );
} );
