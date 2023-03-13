import { useState } from 'react';
import {
	injectIntoCanvasDisplay,
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
import CanvasDisplayLocation from '../components/locations/canvas-display-location';
import PrimaryActionLocation from '../components/locations/primary-action-location';

describe( '@elementor/top-bar API', () => {
	describe.each( [
		{ component: ToolsMenuLocation, name: 'tools' } as const,
		{ component: UtilitiesMenuLocation, name: 'utilities' } as const,
	] )( 'horizontal menu location: $name', ( { component: Component, name } ) => {
		it( 'should render an action', () => {
			// Arrange.
			const onClick = jest.fn();

			// Act.
			registerExampleAction( name, { onClick } );

			// Assert.
			const { getByLabelText } = render( <Component /> );

			getByLabelText( 'Test' ).click();

			expect( onClick ).toHaveBeenCalled();
		} );

		it( 'should render a toggle action', () => {
			// Act.
			registerExampleToggleAction( name );

			// Assert.
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
			// Act.
			registerExampleLink( name );

			// Assert.
			const { getByRole } = render( <Component /> );

			const link = getByRole( 'link' );

			expect( link ).toHaveAttribute( 'href', 'https://elementor.com' );
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'aria-label', 'Test' );
		} );
	} );

	describe( 'popover menu location: main', () => {
		it( 'should render an action', () => {
			// Arrange.
			const onClick = jest.fn();

			// Act
			registerExampleAction( 'main', { onClick } );

			// Assert.
			const { getByText, getByRole } = render( <MainMenuLocation /> );

			getByRole( 'button' ).click(); // Opens the popover menu

			const button = getByText( 'Test' );

			button.click();

			expect( onClick ).toHaveBeenCalled();
		} );

		it( 'should render a toggle action', () => {
			// Act.
			registerExampleToggleAction( 'main' );

			// Assert.
			const { getByRole, getByText } = render( <MainMenuLocation /> );

			getByRole( 'button' ).click(); // Opens the popover menu

			const menuItem = getByRole( 'menuitem' );
			const menuItemContent = getByText( 'Test' );

			expect( menuItem ).not.toHaveClass( 'Mui-selected' );

			menuItemContent.click();

			expect( menuItem ).toHaveClass( 'Mui-selected' );

			menuItemContent.click();

			expect( menuItem ).not.toHaveClass( 'Mui-selected' );
			expect( menuItem ).toHaveAttribute( 'aria-disabled', 'true' );
		} );

		it( 'should render a link', () => {
			// Act.
			registerExampleLink( 'main' );

			// Assert.
			const { getByRole } = render( <MainMenuLocation /> );

			getByRole( 'button' ).click(); // Opens the popover menu

			const link = getByRole( 'menuitem' );

			expect( link ).toHaveAttribute( 'href', 'https://elementor.com' );
			expect( link ).toHaveAttribute( 'target', '_blank' );
		} );
	} );

	it( 'should render tooltip', async () => {
		// Act.
		registerExampleAction( 'tools' );

		// Assert.
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

	it( 'should render icon', () => {
		// Act.
		registerExampleAction( 'tools' );

		// Assert.
		const { queryByText } = render( <ToolsMenuLocation /> );

		const icon = queryByText( 'a' );

		expect( icon ).toBeInTheDocument();
		expect( icon ).toHaveTextContent( 'a' );
	} );

	it( 'should inject into canvas view', () => {
		// Act.
		injectIntoCanvasDisplay( {
			name: 'test',
			filler: () => <span>test</span>,
		} );

		// Assert.
		const { queryByText } = render( <CanvasDisplayLocation /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );

	it( 'should inject into primary action', () => {
		// Act.
		injectIntoPrimaryAction( {
			name: 'test',
			filler: () => <span>test</span>,
		} );

		// Assert.
		const { queryByText } = render( <PrimaryActionLocation /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );

	it.each( [
		{
			name: 'tools' as const,
			max: 5,
			component: ToolsMenuLocation,
		},
		{
			name: 'utilities' as const,
			max: 3,
			component: UtilitiesMenuLocation,
		},
	] )( 'should render $name buttons in popover after the $max button', ( { name, max, component: Component } ) => {
		// Arrange.
		const extraButtonsAfterMax = 2;

		// Act.
		for ( let i = 0; i < max + extraButtonsAfterMax; i++ ) {
			registerAction( name, {
				name: `test-${ i }`,
				props: {
					title: `Test ${ i }`,
					icon: () => <span>a</span>,
				},
			} );
		}

		// Assert.
		const { getAllByRole } = render( <Component /> );

		const horizontalButtons = getAllByRole( 'button' );

		expect( horizontalButtons ).toHaveLength( max + 1 ); // including the popover button.
		expect( horizontalButtons[ max ] ).toHaveAttribute( 'aria-label', 'More' );

		horizontalButtons[ max ].click();

		const menuItems = getAllByRole( 'menuitem' );

		expect( menuItems ).toHaveLength( extraButtonsAfterMax );
	} );

	it( 'should render 2 actions in different groups', () => {
		// Act.
		registerAction( 'main', {
			name: 'test-1',
			props: { title: 'Test 1', icon: () => <span>a</span> },
		} );

		registerAction( 'main', {
			name: 'test-1',
			group: 'exits',
			props: { title: 'Test 1', icon: () => <span>a</span> },
		} );

		// Assert.
		const { getAllByRole, getByRole } = render( <MainMenuLocation /> );

		getByRole( 'button' ).click();

		expect( getAllByRole( 'menuitem' ) ).toHaveLength( 2 );
	} );
} );

function registerExampleAction(
	menuName: MenuName,
	{ onClick = () => null }: { onClick?: () => void } = {}
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
