import {
	getFirstFocusable,
	getItemsId,
	resolveItemsId,
} from 'elementor/modules/atomic-widgets/elements/atomic-menu/handlers/utils';

const buildMenu = ( itemsId = '' ) => {
	const menu = document.createElement( 'nav' );
	const items = document.createElement( 'ul' );

	items.dataset.element_type = 'e-menu-items';

	if ( itemsId ) {
		items.id = itemsId;
	}

	menu.appendChild( items );

	return { menu, items };
};

describe( 'atomic menu handler utils', () => {
	it( 'should use the generated id for aria-controls when the items have no id', () => {
		// Arrange.
		const { menu } = buildMenu();

		// Act & Assert.
		expect( resolveItemsId( menu, 'abc' ) ).toBe( getItemsId( 'abc' ) );
	} );

	it( 'should use the id set on the items element for aria-controls', () => {
		// Arrange.
		const { menu } = buildMenu( 'my-custom-id' );

		// Act & Assert.
		expect( resolveItemsId( menu, 'abc' ) ).toBe( 'my-custom-id' );
	} );

	it( 'should find the first link in the items to move focus to', () => {
		// Arrange.
		const { items } = buildMenu();
		items.innerHTML = '<li><span>text</span></li><li><a href="/a" id="first">A</a></li><li><a href="/b">B</a></li>';

		// Act & Assert.
		expect( getFirstFocusable( items )?.id ).toBe( 'first' );
	} );

	it( 'should return null when there is nothing focusable', () => {
		// Arrange.
		const { items } = buildMenu();
		items.innerHTML = '<li><span>text</span></li>';

		// Act & Assert.
		expect( getFirstFocusable( items ) ).toBeNull();
		expect( getFirstFocusable( null ) ).toBeNull();
	} );
} );
