import { useState } from 'react';
import '@testing-library/jest-dom';
import {
	injectIntoCanvasView,
	injectIntoPrimaryAction,
	registerAction,
	registerLink,
	registerToggleAction,
} from '../locations/index';
import { render, fireEvent, act } from '@testing-library/react';
import ToolsMenuLocation from '../components/locations/tools-menu-location';
import UtilitiesMenuLocation from '../components/locations/utilities-menu-location';
import MainMenuLocation from '../components/locations/main-menu-location';
import { MenuName } from '../locations/register-menu-item';
import CanvasViewLocation from '../components/locations/canvas-view-location';
import PrimaryActionLocation from '../components/locations/primary-action-location';

describe( '@elementor/top-bar API', () => {
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

	it( 'should render tooltip', async () => {
		registerExampleAction( 'tools' );

		const { getByLabelText, queryByRole, findByRole } = render( <ToolsMenuLocation /> );

		const button = getByLabelText( 'Test' );

		expect( queryByRole( 'tooltip' ) ).not.toBeInTheDocument();

		act( () => {
			fireEvent(
				button,
				new MouseEvent( 'mouseover', { bubbles: true } ),
			);
		} );

		expect( await findByRole( 'tooltip' ) ).toHaveTextContent( 'Test' );
	} );

	it( 'should inject into canvas view', () => {
		injectIntoCanvasView( {
			name: 'test',
			filler: () => <span>test</span>,
		} );

		const { queryByText } = render( <CanvasViewLocation /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );

	it( 'should inject into primary action', () => {
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

	it( 'should render 2 actions in different groups', () => {
		registerAction( 'main', {
			name: 'test-1',
			props: { title: 'Test 1', icon: () => <span>a</span> },
		} );

		registerAction( 'main', {
			name: 'test-1',
			group: 'exits',
			props: { title: 'Test 1', icon: () => <span>a</span> },
		} );

		const { getAllByRole, getByRole } = render( <MainMenuLocation /> );

		getByRole( 'button' ).click();

		expect( getAllByRole( 'menuitem' ) ).toHaveLength( 2 );
	} );
} );

function registerExampleAction(
	menuName: MenuName,
	{ onClick = () => {} }: { onClick?: () => void } = {}
) {
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
