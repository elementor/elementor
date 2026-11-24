import { createHooksRegistry, setupHooksRegistry } from 'test-utils';
import { getAnchoredAncestorId, isElementAnchored, type V1Element } from '@elementor/editor-elements';
import { notify } from '@elementor/editor-notifications';

import { initMenuPlacementPrevention } from '../prevent-menu-placement-commands';

jest.mock( '@elementor/editor-notifications', () => ( {
	notify: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	isElementAnchored: jest.fn(),
	getAnchoredAncestorId: jest.fn(),
} ) );

const CREATE_COMMAND = 'document/elements/create';
const MOVE_COMMAND = 'document/elements/move';
const PASTE_COMMAND = 'document/elements/paste';

const MENU_IN_LINK_ID = 'menu-in-link-blocked';
const MENU_IN_MENU_ID = 'menu-in-menu-blocked';

let nextId = 0;

function createElement( type: string, children: V1Element[] = [] ): V1Element {
	const element = {
		id: `${ type }-${ nextId++ }`,
		model: { get: ( key: string ) => ( 'elType' === key ? type : undefined ) },
		children,
	} as unknown as V1Element;

	children.forEach( ( child ) => {
		child.parent = element;
	} );

	return element;
}

function createMenuTree() {
	const item = createElement( 'e-menu-item' );
	const submenuChild = createElement( 'e-flexbox' );
	const submenu = createElement( 'e-menu-submenu', [ submenuChild ] );
	const entry = createElement( 'e-menu-entry', [ item, submenu ] );
	const menu = createElement( 'e-menu', [ entry ] );

	return { menu, entry, item, submenu, submenuChild };
}

function markLinked( ...elements: V1Element[] ) {
	const linkedIds = new Set( elements.map( ( element ) => element.id ) );

	jest.mocked( isElementAnchored ).mockImplementation( ( id ) => linkedIds.has( id ) );
}

function setClipboard( elements: unknown[] ) {
	( window as unknown as { elementorCommon: unknown } ).elementorCommon = {
		storage: { get: () => ( { clipboard: { elements } } ) },
	};
}

const MENU_MODEL = {
	elType: 'e-menu',
	elements: [ { elType: 'e-menu-entry', elements: [ { elType: 'e-menu-item', elements: [] } ] } ],
};

describe( 'prevent menu placement', () => {
	const hooksRegistry = createHooksRegistry();

	const isAllowed = ( command: string, args: unknown ) => hooksRegistry.getByCommand( command )?.apply( args );

	beforeEach( () => {
		jest.mocked( notify ).mockClear();
		jest.mocked( isElementAnchored ).mockReturnValue( false );
		jest.mocked( getAnchoredAncestorId ).mockReturnValue( null );
		setupHooksRegistry( hooksRegistry );
		initMenuPlacementPrevention();
	} );

	describe( 'inside a link', () => {
		it( 'blocks creating a Menu without entry links inside a linked container', () => {
			// Arrange
			const linkedDiv = createElement( 'e-div-block' );
			markLinked( linkedDiv );

			// Act
			const result = isAllowed( CREATE_COMMAND, { container: linkedDiv, model: MENU_MODEL } );

			// Assert
			expect( result ).toBe( false );
			expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: MENU_IN_LINK_ID } ) );
		} );

		it( 'blocks creating a Menu below a linked ancestor', () => {
			// Arrange
			const target = createElement( 'e-flexbox' );
			jest.mocked( getAnchoredAncestorId ).mockImplementation( ( id ) =>
				id === target.id ? 'linked-ancestor' : null
			);

			// Act
			const result = isAllowed( CREATE_COMMAND, { container: target, model: MENU_MODEL } );

			// Assert
			expect( result ).toBe( false );
			expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: MENU_IN_LINK_ID } ) );
		} );

		it( 'blocks creating a container that holds a Menu inside a linked container', () => {
			// Arrange
			const linkedDiv = createElement( 'e-div-block' );
			markLinked( linkedDiv );

			// Act
			const result = isAllowed( CREATE_COMMAND, {
				container: linkedDiv,
				model: { elType: 'e-flexbox', elements: [ MENU_MODEL ] },
			} );

			// Assert
			expect( result ).toBe( false );
		} );

		it( 'blocks moving a Menu into a linked container', () => {
			// Arrange
			const { menu } = createMenuTree();
			const linkedDiv = createElement( 'e-div-block' );
			markLinked( linkedDiv );

			// Act
			const result = isAllowed( MOVE_COMMAND, { containers: [ menu ], target: linkedDiv } );

			// Assert
			expect( result ).toBe( false );
			expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: MENU_IN_LINK_ID } ) );
		} );

		it( 'blocks pasting a Menu into a linked container', () => {
			// Arrange
			const linkedDiv = createElement( 'e-div-block' );
			markLinked( linkedDiv );
			setClipboard( [ MENU_MODEL ] );

			// Act
			const result = isAllowed( PASTE_COMMAND, { container: linkedDiv, storageType: 'localstorage' } );

			// Assert
			expect( result ).toBe( false );
			expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: MENU_IN_LINK_ID } ) );
		} );

		it( 'allows a Menu in an unlinked container', () => {
			// Arrange
			const div = createElement( 'e-div-block' );

			// Act
			const result = isAllowed( CREATE_COMMAND, { container: div, model: MENU_MODEL } );

			// Assert
			expect( result ).toBe( true );
			expect( notify ).not.toHaveBeenCalled();
		} );

		it( 'ignores non-Menu sources', () => {
			// Arrange
			const linkedDiv = createElement( 'e-div-block' );
			markLinked( linkedDiv );

			// Act
			const result = isAllowed( CREATE_COMMAND, {
				container: linkedDiv,
				model: { widgetType: 'e-paragraph' },
			} );

			// Assert
			expect( result ).toBe( true );
			expect( notify ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'inside a Menu', () => {
		it( 'blocks creating a Menu inside a Menu Item', () => {
			// Arrange
			const { item } = createMenuTree();

			// Act
			const result = isAllowed( CREATE_COMMAND, { container: item, model: MENU_MODEL } );

			// Assert
			expect( result ).toBe( false );
			expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: MENU_IN_MENU_ID } ) );
		} );

		it( 'blocks moving a Menu into another Menu', () => {
			// Arrange
			const { item } = createMenuTree();
			const { menu: otherMenu } = createMenuTree();

			// Act
			const result = isAllowed( MOVE_COMMAND, { containers: [ otherMenu ], target: item } );

			// Assert
			expect( result ).toBe( false );
			expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: MENU_IN_MENU_ID } ) );
		} );

		it( 'blocks pasting a Menu into a Menu Item', () => {
			// Arrange
			const { item } = createMenuTree();
			setClipboard( [ MENU_MODEL ] );

			// Act
			const result = isAllowed( PASTE_COMMAND, { container: item, storageType: 'localstorage' } );

			// Assert
			expect( result ).toBe( false );
			expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: MENU_IN_MENU_ID } ) );
		} );

		it( 'allows a Menu inside a Submenu', () => {
			// Arrange
			const { submenuChild } = createMenuTree();

			// Act
			const result = isAllowed( CREATE_COMMAND, { container: submenuChild, model: MENU_MODEL } );

			// Assert
			expect( result ).toBe( true );
			expect( notify ).not.toHaveBeenCalled();
		} );

		it( 'blocks a Menu inside the Menu Item of a Menu that sits in a Submenu', () => {
			// Arrange
			const { submenuChild } = createMenuTree();
			const { menu: nestedMenu, item: nestedItem } = createMenuTree();
			submenuChild.children = [ nestedMenu ];
			nestedMenu.parent = submenuChild;

			// Act
			const result = isAllowed( CREATE_COMMAND, { container: nestedItem, model: MENU_MODEL } );

			// Assert
			expect( result ).toBe( false );
			expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: MENU_IN_MENU_ID } ) );
		} );

		it( 'allows moving a Menu Item within its Menu', () => {
			// Arrange
			const { menu, entry } = createMenuTree();

			// Act
			const result = isAllowed( MOVE_COMMAND, { containers: [ entry ], target: menu } );

			// Assert
			expect( result ).toBe( true );
		} );
	} );
} );
