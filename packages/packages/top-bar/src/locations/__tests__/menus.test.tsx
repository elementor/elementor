import { createMenu } from '../menus';
import { act, fireEvent, render } from '@testing-library/react';
import { createMockMenuAction, createMockMenuLink, createMockMenuToggleAction } from 'test-utils';

describe( '@elementor/top-bar - Menus API', () => {
	it( 'should create a menu with default group when not provided', () => {
		// Act.
		const menu = createMenu( {
			name: 'test',
		} );

		menu.registerAction( createMockMenuAction() );

		const { getByRole } = renderMenu( menu );

		// Assert.
		expect( getByRole( 'button' ) ).toBeInTheDocument();
	} );

	it( 'should create a menu with groups and append a default group', () => {
		// Act.
		const menu = createMenu( {
			name: 'test',
			groups: [ 'testGroup' ],
		} );

		menu.registerAction( createMockMenuAction() );

		menu.registerLink( {
			...createMockMenuLink(),
			group: 'testGroup',
		} );

		const { getByRole } = renderMenu( menu );

		// Assert.
		expect( getByRole( 'button' ) ).toBeInTheDocument();
		expect( getByRole( 'link' ) ).toBeInTheDocument();
	} );

	it( 'should register an action', () => {
		// Arrange.
		const onClick = jest.fn();

		// Act.
		const menu = createMenu( {
			name: 'test',
		} );

		menu.registerAction( createMockMenuAction( { onClick } ) );

		const { getByRole } = renderMenu( menu );

		// Assert.
		const action = getByRole( 'button' );

		expect( action ).toBeInTheDocument();
		expect( action ).toHaveAttribute( 'aria-label', 'Test' );

		// Act.
		action.click();

		// Assert.
		expect( onClick ).toHaveBeenCalled();
	} );

	it( 'should register a toggle action', () => {
		// Act.
		const menu = createMenu( {
			name: 'test',
		} );

		menu.registerToggleAction( createMockMenuToggleAction() );

		const { getByRole } = renderMenu( menu );

		// Assert.
		const toggleAction = getByRole( 'button' );

		expect( toggleAction ).toHaveAttribute( 'aria-pressed', 'false' );
		expect( toggleAction ).toHaveAttribute( 'value', 'test-value' );

		// Act.
		toggleAction.click();

		// Assert.
		expect( toggleAction ).toHaveAttribute( 'aria-pressed', 'true' );

		// Act.
		toggleAction.click();

		// Assert.
		expect( toggleAction ).toHaveAttribute( 'aria-pressed', 'false' );
		expect( toggleAction ).toHaveAttribute( 'disabled' );
	} );

	it( 'should register a link', () => {
		// Act.
		const menu = createMenu( {
			name: 'test',
		} );

		menu.registerLink( createMockMenuLink() );

		const { getByRole } = renderMenu( menu );

		// Assert.
		const link = getByRole( 'link' );

		expect( link ).toBeInTheDocument();
		expect( link ).toHaveAttribute( 'href', 'https://elementor.com' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'aria-label', 'Test' );
	} );

	it( 'should not register an action when passing a non-existing group', () => {
		// Act.
		const menu = createMenu( {
			name: 'test',
		} );

		menu.registerLink( {
			...createMockMenuLink(),
			group: 'non-existing-group' as 'default', // Emulate a runtime error.
		} );

		const { queryByRole } = renderMenu( menu );

		// Assert.
		expect( queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	it( 'should register an action tooltip', async () => {
		// Arrange.
		const menu = createMenu( {
			name: 'test',
		} );

		// Act.
		menu.registerAction( createMockMenuAction() );

		// Assert.
		const { getByLabelText, queryByRole, findByRole } = renderMenu( menu );

		const button = getByLabelText( 'Test' );

		expect( queryByRole( 'tooltip' ) ).not.toBeInTheDocument();

		// Act.
		act( () => {
			fireEvent(
				button,
				new MouseEvent( 'mouseover', { bubbles: true } ),
			);
		} );

		// Assert.
		expect( await findByRole( 'tooltip' ) ).toHaveTextContent( 'Test' );
	} );

	it( 'should register an action icon', () => {
		// Arrange.
		const menu = createMenu( {
			name: 'test',
		} );

		// Act.
		menu.registerAction( createMockMenuAction() );

		// Assert.
		const { queryByText } = renderMenu( menu );

		const icon = queryByText( 'a' );

		expect( icon ).toBeInTheDocument();
		expect( icon ).toHaveTextContent( 'a' );
	} );

	it.each( [
		{
			type: 'action',
			action: 'registerAction',
		},
		{
			type: 'toggle action',
			action: 'registerToggleAction',
		},
		{
			type: 'link',
			action: 'registerLink',
		},
	] as const )( 'should register a hidden $type', ( { type, action } ) => {
		// Arrange.
		const menu = createMenu( {
			name: 'test',
		} );

		// Act.
		menu[ action ]( {
			name: 'hidden',
			useProps: () => ( {
				title: `hidden-${ type }`,
				icon: () => <div />,
				visible: false,
			} ),
		} );

		// Assert.
		const { queryByLabelText } = renderMenu( menu );

		expect( queryByLabelText( `hidden-${ type }` ) ).not.toBeInTheDocument();
	} );
} );

function renderMenu<TGroup extends string>( menu: ReturnType<typeof createMenu<TGroup>> ) {
	const MenuComponent = () => {
		const groupedItems = menu.useMenuItems();
		const allItems = Object.values( groupedItems ).flat();

		return (
			<div>
				{ allItems.map( ( { MenuItem, id } ) => <MenuItem key={ id } /> ) }
			</div>
		);
	};

	return render( <MenuComponent /> );
}
