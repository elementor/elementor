import '@testing-library/jest-dom';
import {
	injectIntoCanvasView,
	injectIntoPrimaryAction,
	registerAction,
	registerLink,
	registerToggleAction,
} from '../index';
import { render, fireEvent, act } from '@testing-library/react';
import { useState } from 'react';
import ToolsMenuLocation from '../components/locations/tools-menu-location';
import UtilitiesMenuLocation from '../components/locations/utilities-menu-location';
import MainMenuLocation from '../components/locations/main-menu-location';
import { MenuName } from '../locations/register-menu-item';
import CanvasViewLocation from '../components/locations/canvas-view-location';
import PrimaryActionLocation from '../components/locations/primary-action-location';

describe( '@elementor/top-bar API', () => {
	// TODO: Make sure there are no animations in material

	it( 'should render tooltip', async () => {
		registerAction( 'tools', {
			name: 'test-action',
			props: {
				title: 'Test Action',
				icon: () => <span>a</span>,
			},
		} );

		const { getByLabelText, queryByRole, findByRole } = render( <ToolsMenuLocation /> );

		const button = getByLabelText( 'Test Action' );

		expect( queryByRole( 'tooltip' ) ).not.toBeInTheDocument();

		act( () => {
			fireEvent(
				button,
				new MouseEvent( 'mouseover', { bubbles: true } ),
			);
		} );

		expect( await findByRole( 'tooltip' ) ).toHaveTextContent( 'Test Action' );
	} );

	it( 'inject into canvas view', () => {
		injectIntoCanvasView( {
			name: 'test',
			filler: () => <span>test</span>,
		} );

		const { queryByText } = render( <CanvasViewLocation /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );

	it( 'inject into primary action', () => {
		injectIntoPrimaryAction( {
			name: 'test',
			filler: () => <span>test</span>,
		} );

		const { queryByText } = render( <PrimaryActionLocation /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );

	it( 'should render tools buttons in popover after the fifth button', function() {
		const buttons = [
			{ name: 'test-1', title: 'Test 1' },
			{ name: 'test-2', title: 'Test 2' },
			{ name: 'test-3', title: 'Test 3' },
			{ name: 'test-4', title: 'Test 4' },
			{ name: 'test-5', title: 'Test 5' },
			{ name: 'test-6', title: 'Test 6' },
			{ name: 'test-7', title: 'Test 7' },
		];

		buttons.forEach( ( button ) => {
			registerAction( 'tools', {
				name: button.name,
				props: {
					title: button.title,
					icon: () => <span>a</span>,
				},
			}
			);
		} );

		const { getAllByRole } = render( <ToolsMenuLocation /> );

		const horizontalButtons = getAllByRole( 'button' );

		expect( horizontalButtons ).toHaveLength( 6 ); // including the popover button.
		expect( horizontalButtons[ 5 ] ).toHaveAttribute( 'aria-label', 'More' );

		horizontalButtons[ 5 ].click();

		const menuItems = getAllByRole( 'menuitem' );

		expect( menuItems ).toHaveLength( 2 );
	} );

	describe.each( [
		{ component: MainMenuLocation, name: 'main' } as const,
	] )( 'popover menu location: $name', ( { component: Component, name } ) => {
		it( 'should render an action', () => {
			const onClick = jest.fn();

			registerExampleAction( name, { onClick } );

			const { getByText, getByRole } = render( <Component /> );

			getByRole( 'button' ).click();

			const button = getByText( 'Test' );

			button.click();

			expect( onClick ).toHaveBeenCalled();
		} );

		it( 'should render a toggle action', () => {
			registerExampleToggleAction( name );

			const { getByRole, getByText } = render( <Component /> );

			getByRole( 'button' ).click();

			const menuItem = getByRole( 'menuitem' );
			const menuItemButton = getByText( 'Test' );

			expect( menuItem ).not.toHaveClass( 'Mui-selected' );

			menuItemButton.click();

			expect( menuItem ).toHaveClass( 'Mui-selected' );

			menuItemButton.click();

			expect( menuItem ).not.toHaveClass( 'Mui-selected' );
			expect( menuItem ).toHaveAttribute( 'aria-disabled', 'true' );
			expect( menuItemButton ).toHaveAttribute( 'disabled' );
		} );

		it( 'should render a link', () => {
			registerExampleLink( name );

			const { getByRole } = render( <Component /> );

			getByRole( 'button' ).click();

			const link = getByRole( 'link' );

			expect( link ).toHaveAttribute( 'href', 'https://elementor.com' );
			expect( link ).toHaveAttribute( 'target', '_blank' );
		} );
	} );

	describe.each( [
		{ component: ToolsMenuLocation, name: 'tools' } as const,
		{ component: UtilitiesMenuLocation, name: 'utilities' } as const,
	] )( 'horizontal menu location: $name', ( { component: Component, name } ) => {
		it( 'should render an action', () => {
			const onClick = jest.fn();

			registerExampleAction( name, { onClick } );

			const { getByLabelText } = render( <Component /> );

			getByLabelText( 'Test' ).click();

			expect( onClick ).toHaveBeenCalled();
		} );

		it( 'should render a toggle action', () => {
			registerExampleToggleAction( name );

			const { getByLabelText } = render( <Component /> );

			const button = getByLabelText( 'Test' );

			expect( button ).toHaveAttribute( 'aria-pressed', 'false' );
			expect( button ).toHaveAttribute( 'value', 'test-value' );

			button.click();

			expect( button ).toHaveAttribute( 'aria-pressed', 'true' );

			button.click();

			expect( button ).toHaveAttribute( 'aria-pressed', 'false' );
			expect( button ).toHaveAttribute( 'disabled' );
		} );

		it( 'should render a link', () => {
			registerExampleLink( name );

			const { getByRole } = render( <Component /> );

			const link = getByRole( 'link' );

			expect( link ).toHaveAttribute( 'href', 'https://elementor.com' );
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'aria-label', 'Test' );
		} );
	} );
} );

function registerExampleAction( menuName: MenuName, { onClick }: { onClick: () => void } ) {
	registerAction(
		menuName,
		{
			name: 'test',
			props: {
				title: 'Test',
				icon: () => <span>a</span>,
				onClick,
			},
		}
	);
}

function registerExampleToggleAction( menuName: MenuName ) {
	registerToggleAction(
		menuName,
		{
			name: 'test',
			useProps: () => {
				const [ selected, setSelected ] = useState( false );
				const [ clicks, setClicks ] = useState( 0 );

				return {
					title: 'Test',
					icon: () => <span>a</span>,
					selected,
					onClick: () => {
						setSelected( ( prev ) => ! prev );
						setClicks( ( prev ) => prev + 1 );
					},
					value: 'test-value',
					disabled: clicks > 1,
				};
			},
		}
	);
}

function registerExampleLink( menuName: MenuName ) {
	registerLink(
		menuName,
		{
			name: 'test',
			props: {
				title: 'Test',
				icon: () => <span>a</span>,
				href: 'https://elementor.com',
				target: '_blank',
			},
		}
	);
}
