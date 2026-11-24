jest.mock( '@elementor/frontend-handlers', () => ( {
	register: jest.fn(),
} ), { virtual: true } );

const ORIGIN = 'http://localhost';
const CURRENT_CLASS = 'e--current';
const ANCESTOR_CLASS = 'e--current-ancestor';

class IntersectionObserverMock {
	static instances = [];

	constructor( callback ) {
		this.callback = callback;
		this.targets = [];
		this.disconnected = false;
		IntersectionObserverMock.instances.push( this );
	}

	observe( target ) {
		this.targets.push( target );
	}

	disconnect() {
		this.disconnected = true;
	}

	trigger( isIntersecting ) {
		this.callback( this.targets.map( ( target ) => ( { target, isIntersecting } ) ) );
	}
}

async function loadRegistration() {
	jest.resetModules();
	jest.clearAllMocks();

	await import( 'elementor/modules/atomic-widgets/elements/atomic-menu/handlers/atomic-menu-current-handler' );

	const { register } = jest.requireMock( '@elementor/frontend-handlers' );

	return register.mock.calls.map( ( [ call ] ) => call )[ 0 ];
}

function buildMenu( links ) {
	const menu = document.createElement( 'nav' );
	menu.dataset.element_type = 'e-menu';

	const items = links.map( ( href ) => {
		const entry = document.createElement( 'li' );
		entry.dataset.element_type = 'e-menu-entry';

		const item = document.createElement( null === href ? 'span' : 'a' );
		item.dataset.element_type = 'e-menu-item';

		if ( null !== href ) {
			item.setAttribute( 'href', href );
		}

		entry.append( item );
		menu.append( entry );

		return item;
	} );

	document.body.append( menu );

	return { menu, items };
}

function buildEntries( parent, nodes, items ) {
	const list = document.createElement( 'ul' );

	nodes.forEach( ( { key, href = null, children = [] } ) => {
		const entry = document.createElement( 'li' );
		entry.dataset.element_type = 'e-menu-entry';

		const item = document.createElement( null === href ? 'span' : 'a' );
		item.dataset.element_type = 'e-menu-item';

		if ( null !== href ) {
			item.setAttribute( 'href', href );
		}

		entry.append( item );
		items[ key ] = item;

		if ( children.length ) {
			const trigger = document.createElement( 'button' );
			trigger.dataset.element_type = 'e-menu-submenu-trigger';

			const submenu = document.createElement( 'div' );
			submenu.dataset.element_type = 'e-menu-submenu';
			buildEntries( submenu, children, items );

			entry.append( trigger, submenu );
		}

		list.append( entry );
	} );

	parent.append( list );
}

function buildNestedMenu( nodes, container = document.body ) {
	const menu = document.createElement( 'nav' );
	menu.dataset.element_type = 'e-menu';
	const items = {};

	buildEntries( menu, nodes, items );
	container.append( menu );

	return { menu, items };
}

function addSection( id ) {
	const section = document.createElement( 'section' );
	section.id = id;
	document.body.append( section );

	return section;
}

describe( 'atomic-menu current handler', () => {
	const originalObserver = global.IntersectionObserver;
	let registration;

	beforeEach( async () => {
		IntersectionObserverMock.instances = [];
		global.IntersectionObserver = IntersectionObserverMock;
		window.history.pushState( {}, '', '/about/' );
		registration = await loadRegistration();
	} );

	afterEach( () => {
		global.IntersectionObserver = originalObserver;
		document.body.innerHTML = '';
	} );

	let childRenderCallbacks;

	function run( menu, signal = new AbortController().signal ) {
		childRenderCallbacks = [];

		registration.callback( {
			element: menu,
			signal,
			listenToChildren: () => ( { render: ( callback ) => childRenderCallbacks.push( callback ) } ),
		} );
	}

	function renderChild( item ) {
		childRenderCallbacks.forEach( ( callback ) => callback( { detail: { element: item } } ) );
	}

	it( 'should register for the menu element', () => {
		expect( registration ).toEqual( {
			elementType: 'e-menu',
			id: 'e-menu-current-handler',
			callback: expect.any( Function ),
		} );
	} );

	it( 'should mark only the item that links to the current page', () => {
		// Arrange
		const { menu, items } = buildMenu( [ `${ ORIGIN }/`, `${ ORIGIN }/about`, `${ ORIGIN }/contact/` ] );

		// Act
		run( menu );

		// Assert
		expect( items.map( ( item ) => item.classList.contains( CURRENT_CLASS ) ) ).toEqual( [ false, true, false ] );
		expect( items.map( ( item ) => item.getAttribute( 'aria-current' ) ) ).toEqual( [ null, 'page', null ] );
	} );

	it( 'should keep the editor preview class on an item that detection does not match', () => {
		// Arrange
		const { menu, items } = buildMenu( [ `${ ORIGIN }/`, `${ ORIGIN }/about` ] );
		items[ 0 ].setAttribute( 'data-e-preview-state', CURRENT_CLASS );
		items[ 0 ].classList.add( CURRENT_CLASS );

		// Act
		run( menu );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( true );
		expect( items[ 0 ].hasAttribute( 'aria-current' ) ).toBe( false );
		expect( items[ 1 ].classList.contains( CURRENT_CLASS ) ).toBe( true );
	} );

	it( 'should mark every item that links to the current page', () => {
		// Arrange
		const { menu, items } = buildMenu( [ `${ ORIGIN }/about/`, `${ ORIGIN }/about`, `${ ORIGIN }/contact/` ] );

		// Act
		run( menu );

		// Assert
		expect( items.map( ( item ) => item.classList.contains( CURRENT_CLASS ) ) ).toEqual( [ true, true, false ] );
	} );

	it( 'should never mark an item without a link', () => {
		// Arrange
		const { menu, items } = buildMenu( [ null, `${ ORIGIN }/about/` ] );

		// Act
		run( menu );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
		expect( items[ 0 ].hasAttribute( 'aria-current' ) ).toBe( false );
	} );

	it( 'should never mark a placeholder hash link', () => {
		// Arrange
		const { menu, items } = buildMenu( [ '#', `${ ORIGIN }/about/` ] );

		// Act
		run( menu );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
		expect( items[ 0 ].hasAttribute( 'aria-current' ) ).toBe( false );
	} );

	it( 'should never mark a link to an external domain', () => {
		// Arrange
		const { menu, items } = buildMenu( [ 'https://example.com/about/' ] );

		// Act
		run( menu );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
	} );

	it( 'should mark items inside a collapsed menu', () => {
		// Arrange
		const { menu, items } = buildMenu( [ `${ ORIGIN }/about/` ] );
		menu.hidden = true;

		// Act
		run( menu );

		// Assert
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( true );
	} );

	describe( 'one-page anchors', () => {
		beforeEach( () => {
			window.history.pushState( {}, '', '/' );
		} );

		it( 'should mark the anchor item while its section is in view and give Home back when it leaves', () => {
			// Arrange
			addSection( 'contact' );
			const { menu, items } = buildMenu( [ `${ ORIGIN }/`, `${ ORIGIN }/#contact` ] );
			const [ home, contact ] = items;
			run( menu );
			const [ observer ] = IntersectionObserverMock.instances;

			// Assert: at the top Home is current.
			expect( home.classList.contains( CURRENT_CLASS ) ).toBe( true );
			expect( home.getAttribute( 'aria-current' ) ).toBe( 'page' );

			// Act: the section comes into view.
			observer.trigger( true );

			// Assert
			expect( contact.classList.contains( CURRENT_CLASS ) ).toBe( true );
			expect( contact.getAttribute( 'aria-current' ) ).toBe( 'location' );
			expect( home.classList.contains( CURRENT_CLASS ) ).toBe( false );
			expect( home.hasAttribute( 'aria-current' ) ).toBe( false );

			// Act: scrolled back above the first section.
			observer.trigger( false );

			// Assert
			expect( contact.classList.contains( CURRENT_CLASS ) ).toBe( false );
			expect( contact.hasAttribute( 'aria-current' ) ).toBe( false );
			expect( home.classList.contains( CURRENT_CLASS ) ).toBe( true );
			expect( home.getAttribute( 'aria-current' ) ).toBe( 'page' );
		} );

		it( 'should mark every item that links to the section in view', () => {
			// Arrange
			addSection( 'contact' );
			const { menu, items } = buildMenu( [ `${ ORIGIN }/#contact`, `${ ORIGIN }/#contact` ] );
			run( menu );

			// Act
			IntersectionObserverMock.instances.forEach( ( observer ) => observer.trigger( true ) );

			// Assert
			expect( items.map( ( item ) => item.classList.contains( CURRENT_CLASS ) ) ).toEqual( [ true, true ] );
		} );

		it( 'should never mark an anchor item whose target does not exist', () => {
			// Arrange
			const { menu, items } = buildMenu( [ `${ ORIGIN }/#missing` ] );

			// Act
			run( menu );

			// Assert
			expect( IntersectionObserverMock.instances ).toHaveLength( 0 );
			expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( false );
		} );

		it( 'should find a target whose id is not ASCII', () => {
			// Arrange
			addSection( 'צור-קשר' );
			const { menu, items } = buildMenu( [ `${ ORIGIN }/#%D7%A6%D7%95%D7%A8-%D7%A7%D7%A9%D7%A8` ] );
			run( menu );

			// Act
			IntersectionObserverMock.instances[ 0 ].trigger( true );

			// Assert
			expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( true );
		} );

		it( 'should ignore an anchor link to another page', () => {
			// Arrange
			addSection( 'contact' );
			const { menu } = buildMenu( [ `${ ORIGIN }/other/#contact` ] );

			// Act
			run( menu );

			// Assert
			expect( IntersectionObserverMock.instances ).toHaveLength( 0 );
		} );

		it( 'should stop observing when the handler is aborted', () => {
			// Arrange
			addSection( 'contact' );
			const { menu } = buildMenu( [ `${ ORIGIN }/#contact` ] );
			const controller = new AbortController();
			run( menu, controller.signal );

			// Act
			controller.abort();

			// Assert
			expect( IntersectionObserverMock.instances[ 0 ].disconnected ).toBe( true );
		} );
	} );

	it( 'should refresh Current when a menu item is rendered again with another link', () => {
		// Arrange
		const { menu, items } = buildMenu( [ `${ ORIGIN }/`, `${ ORIGIN }/contact/` ] );
		run( menu );

		// Act
		items[ 0 ].setAttribute( 'href', `${ ORIGIN }/about/` );
		renderChild( items[ 0 ] );

		// Assert
		expect( items.map( ( item ) => item.classList.contains( CURRENT_CLASS ) ) ).toEqual( [ true, false ] );
	} );

	it( 'should pick up an item added after the first run', () => {
		// Arrange
		const { menu } = buildMenu( [ `${ ORIGIN }/contact/` ] );
		run( menu );
		const entry = document.createElement( 'li' );
		const added = document.createElement( 'a' );
		added.dataset.element_type = 'e-menu-item';
		added.setAttribute( 'href', `${ ORIGIN }/about/` );
		entry.append( added );
		menu.append( entry );

		// Act
		renderChild( added );

		// Assert
		expect( added.classList.contains( CURRENT_CLASS ) ).toBe( true );
	} );

	it( 'should disconnect the old observers when it refreshes', () => {
		// Arrange
		const { menu, items } = buildMenu( [ `${ ORIGIN }/about/#contact` ] );
		const section = document.createElement( 'section' );
		section.id = 'contact';
		document.body.append( section );
		run( menu );
		const [ firstObserver ] = IntersectionObserverMock.instances;

		// Act
		renderChild( items[ 0 ] );

		// Assert
		expect( firstObserver.disconnected ).toBe( true );
		expect( IntersectionObserverMock.instances ).toHaveLength( 2 );
	} );

	it( 'should ignore a child that belongs to a nested menu', () => {
		// Arrange
		const { menu } = buildMenu( [ `${ ORIGIN }/contact/` ] );
		const nested = document.createElement( 'nav' );
		nested.dataset.element_type = 'e-menu';
		const nestedItem = document.createElement( 'a' );
		nestedItem.dataset.element_type = 'e-menu-item';
		nestedItem.setAttribute( 'href', `${ ORIGIN }/about/#contact` );
		nested.append( nestedItem );
		menu.append( nested );
		const section = document.createElement( 'section' );
		section.id = 'contact';
		document.body.append( section );
		run( menu );
		const observersBefore = IntersectionObserverMock.instances.length;

		// Act
		renderChild( nestedItem );

		// Assert
		expect( IntersectionObserverMock.instances ).toHaveLength( observersBefore );
	} );

	it( 'should leave the items of a nested menu to that menu', () => {
		// Arrange
		const { menu, items } = buildMenu( [ `${ ORIGIN }/about/` ] );
		const nested = document.createElement( 'nav' );
		nested.dataset.element_type = 'e-menu';
		const nestedItem = document.createElement( 'a' );
		nestedItem.dataset.element_type = 'e-menu-item';
		nestedItem.setAttribute( 'href', `${ ORIGIN }/about/#sec` );
		nested.append( nestedItem );
		items[ 0 ].append( nested );
		const section = document.createElement( 'section' );
		section.id = 'sec';
		document.body.append( section );

		// Act
		run( menu );

		// Assert
		expect( IntersectionObserverMock.instances ).toHaveLength( 0 );
		expect( items[ 0 ].classList.contains( CURRENT_CLASS ) ).toBe( true );
	} );

	describe( 'current ancestors', () => {
		const isAncestor = ( item ) => item.classList.contains( ANCESTOR_CLASS );

		it( 'should mark the parent and grandparent items of a nested current page link, unlinked parents included', () => {
			// Arrange
			const { menu, items } = buildNestedMenu( [
				{ key: 'grandparent', children: [
					{ key: 'parent', href: `${ ORIGIN }/services/`, children: [
						{ key: 'current', href: `${ ORIGIN }/about/` },
					] },
				] },
			] );

			// Act
			run( menu );

			// Assert
			expect( isAncestor( items.grandparent ) ).toBe( true );
			expect( isAncestor( items.parent ) ).toBe( true );
			expect( isAncestor( items.current ) ).toBe( false );
			expect( items.current.classList.contains( CURRENT_CLASS ) ).toBe( true );
		} );

		it( 'should not mark siblings or unrelated entries', () => {
			// Arrange
			const { menu, items } = buildNestedMenu( [
				{ key: 'parent', children: [
					{ key: 'current', href: `${ ORIGIN }/about/` },
					{ key: 'sibling', href: `${ ORIGIN }/team/`, children: [
						{ key: 'niece', href: `${ ORIGIN }/team/jane/` },
					] },
				] },
				{ key: 'unrelated', children: [ { key: 'other', href: `${ ORIGIN }/contact/` } ] },
			] );

			// Act
			run( menu );

			// Assert
			expect( isAncestor( items.parent ) ).toBe( true );
			expect( [ 'sibling', 'niece', 'unrelated', 'other' ].map( ( key ) => isAncestor( items[ key ] ) ) )
				.toEqual( [ false, false, false, false ] );
		} );

		it( 'should mark a current item as ancestor only when it also has a current descendant', () => {
			// Arrange
			const { menu, items } = buildNestedMenu( [
				{ key: 'parent', href: `${ ORIGIN }/about/`, children: [
					{ key: 'child', href: `${ ORIGIN }/about` },
				] },
				{ key: 'alone', href: `${ ORIGIN }/about/` },
			] );

			// Act
			run( menu );

			// Assert
			expect( isAncestor( items.parent ) ).toBe( true );
			expect( isAncestor( items.alone ) ).toBe( false );
		} );

		it( 'should clear the ancestor when the nested item is rendered again with another link', () => {
			// Arrange
			const { menu, items } = buildNestedMenu( [
				{ key: 'parent', children: [ { key: 'current', href: `${ ORIGIN }/about/` } ] },
			] );
			run( menu );
			expect( isAncestor( items.parent ) ).toBe( true );

			// Act
			items.current.setAttribute( 'href', `${ ORIGIN }/contact/` );
			renderChild( items.current );

			// Assert
			expect( isAncestor( items.parent ) ).toBe( false );
		} );

		it( 'should move the ancestor with the anchor section in view and clear it when the section leaves', () => {
			// Arrange
			window.history.pushState( {}, '', '/' );
			addSection( 'contact' );
			const { menu, items } = buildNestedMenu( [
				{ key: 'home', href: `${ ORIGIN }/` },
				{ key: 'parent', children: [ { key: 'anchor', href: `${ ORIGIN }/#contact` } ] },
			] );
			run( menu );
			const [ observer ] = IntersectionObserverMock.instances;

			// Act
			observer.trigger( true );

			// Assert
			expect( isAncestor( items.parent ) ).toBe( true );

			// Act
			observer.trigger( false );

			// Assert
			expect( isAncestor( items.parent ) ).toBe( false );
		} );

		const buildMenuInsideSubmenu = ( innerNodes ) => {
			const outer = buildNestedMenu( [
				{ key: 'outerParent', children: [ { key: 'outerChild', href: `${ ORIGIN }/contact/` } ] },
				{ key: 'outerSibling', children: [ { key: 'outerOther', href: `${ ORIGIN }/team/` } ] },
			] );
			const submenu = outer.items.outerParent.parentElement.querySelector( '[data-element_type="e-menu-submenu"]' );
			const inner = buildNestedMenu( innerNodes, submenu );

			return { outer, inner };
		};

		it( 'should mark the outer entry whose submenu holds a nested menu with the current item', () => {
			// Arrange
			const { outer, inner } = buildMenuInsideSubmenu( [
				{ key: 'innerParent', children: [ { key: 'innerCurrent', href: `${ ORIGIN }/about/` } ] },
			] );

			// Act
			run( outer.menu );
			run( inner.menu );

			// Assert
			expect( isAncestor( outer.items.outerParent ) ).toBe( true );
			expect( isAncestor( outer.items.outerSibling ) ).toBe( false );
			expect( isAncestor( inner.items.innerParent ) ).toBe( true );
			expect( isAncestor( inner.items.innerCurrent ) ).toBe( false );
		} );

		it( 'should mark the outer entry when the nested menu runs before the outer one', () => {
			// Arrange
			const { outer, inner } = buildMenuInsideSubmenu( [
				{ key: 'innerCurrent', href: `${ ORIGIN }/about/` },
			] );

			// Act
			run( inner.menu );
			run( outer.menu );

			// Assert
			expect( isAncestor( outer.items.outerParent ) ).toBe( true );
			expect( outer.items.outerParent.classList.contains( CURRENT_CLASS ) ).toBe( false );
		} );

		it( 'should move the outer ancestor with an anchor section of a nested menu', () => {
			// Arrange
			window.history.pushState( {}, '', '/' );
			addSection( 'contact' );
			const { outer, inner } = buildMenuInsideSubmenu( [
				{ key: 'innerAnchor', href: `${ ORIGIN }/#contact` },
			] );
			run( outer.menu );
			run( inner.menu );
			const [ observer ] = IntersectionObserverMock.instances;

			// Act
			observer.trigger( true );

			// Assert
			expect( isAncestor( outer.items.outerParent ) ).toBe( true );

			// Act
			observer.trigger( false );

			// Assert
			expect( isAncestor( outer.items.outerParent ) ).toBe( false );
		} );

		it( 'should stop following the nested menu once the outer handler is aborted', () => {
			// Arrange
			window.history.pushState( {}, '', '/' );
			addSection( 'contact' );
			const { outer, inner } = buildMenuInsideSubmenu( [
				{ key: 'innerAnchor', href: `${ ORIGIN }/#contact` },
			] );
			const controller = new AbortController();
			run( outer.menu, controller.signal );
			run( inner.menu );
			const [ observer ] = IntersectionObserverMock.instances;
			controller.abort();

			// Act
			observer.trigger( true );

			// Assert
			expect( isAncestor( outer.items.outerParent ) ).toBe( false );
		} );

		it( 'should not mark any ancestor when nothing is current', () => {
			// Arrange
			const { menu, items } = buildNestedMenu( [
				{ key: 'parent', children: [ { key: 'child', href: `${ ORIGIN }/contact/` } ] },
			] );

			// Act
			run( menu );

			// Assert
			expect( Object.values( items ).some( isAncestor ) ).toBe( false );
		} );

		it( 'should not mark ancestors of an item that is only in editor preview state', () => {
			// Arrange
			const { menu, items } = buildNestedMenu( [
				{ key: 'parent', children: [ { key: 'child', href: `${ ORIGIN }/contact/` } ] },
			] );
			items.child.setAttribute( 'data-e-preview-state', CURRENT_CLASS );
			items.child.classList.add( CURRENT_CLASS );

			// Act
			run( menu );

			// Assert
			expect( isAncestor( items.parent ) ).toBe( false );
		} );
	} );
} );
