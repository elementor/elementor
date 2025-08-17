import * as React from 'react';
import { TrashIcon } from '@elementor/icons';
import { fireEvent, render, screen } from '@testing-library/react';

import { VariableEditMenu } from '../variable-edit-menu';

// Mock the MUI components we need
jest.mock( '@elementor/ui', () => {
	const actual = jest.requireActual( '@elementor/ui' );
	return {
		...actual,
		IconButton: ( props: any ) => (
			<button { ...props } data-testid="icon-button">
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
		}: any ) =>
			open && (
				<div
					role="menu"
					data-testid="menu"
					data-menuprops={ JSON.stringify( {
						MenuListProps,
						PaperProps,
						disablePortal,
						anchorOrigin,
						transformOrigin,
					} ) }
					{ ...props }
				>
					{ children }
				</div>
			),
		MenuItem: ( { sx, ...props }: any ) => (
			<div role="menuitem" data-testid="menu-item" data-sx={ JSON.stringify( sx ) } { ...props }>
				{ props.children }
			</div>
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

		expect( screen.getByTestId( 'icon-button' ) ).toBeInTheDocument();
	} );

	it( 'should render menu items when menu is open', () => {
		// Override usePopupState mock for this test
		jest.spyOn( require( '@elementor/ui' ), 'usePopupState' ).mockImplementation( () => ( {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
			close: jest.fn(),
			open: jest.fn(),
			setAnchorEl: jest.fn(),
			toggle: jest.fn(),
		} ) );

		renderComponent();

		const menu = screen.getByTestId( 'menu' );
		expect( menu ).toBeInTheDocument();

		// Verify menu props
		const menuProps = JSON.parse( menu.getAttribute( 'data-menuprops' ) || '{}' );
		expect( menuProps.MenuListProps ).toEqual( { dense: true } );
		expect( menuProps.PaperProps ).toEqual( { elevation: 6 } );
		expect( menuProps.disablePortal ).toBe( true );
		expect( menuProps.anchorOrigin ).toEqual( {
			vertical: 'bottom',
			horizontal: 'right',
		} );
		expect( menuProps.transformOrigin ).toEqual( {
			vertical: 'top',
			horizontal: 'right',
		} );

		expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
	} );

	it( 'should handle disabled state', () => {
		renderComponent( { disabled: true } );

		expect( screen.getByTestId( 'icon-button' ) ).toBeDisabled();
	} );

	it( 'should call action onClick when menu item is clicked', () => {
		// Override usePopupState mock for this test
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

		const menuItem = screen.getByTestId( 'menu-item' );
		fireEvent.click( menuItem );

		expect( mockMenuActions[ 0 ].onClick ).toHaveBeenCalled();
		expect( mockClose ).toHaveBeenCalled();
	} );

	it( 'should apply correct styles to menu items', () => {
		// Override usePopupState mock for this test
		jest.spyOn( require( '@elementor/ui' ), 'usePopupState' ).mockImplementation( () => ( {
			isOpen: true,
			anchorEl: document.createElement( 'div' ),
			close: jest.fn(),
			open: jest.fn(),
			setAnchorEl: jest.fn(),
			toggle: jest.fn(),
		} ) );

		renderComponent();

		const menuItem = screen.getByTestId( 'menu-item' );
		const sx = JSON.parse( menuItem.getAttribute( 'data-sx' ) || '{}' );

		expect( sx ).toEqual( {
			color: 'error.main',
			gap: 1,
		} );
	} );

	it( 'should render multiple menu items', () => {
		// Override usePopupState mock for this test
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
