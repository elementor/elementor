import { getAnchoredAncestorId, getAnchoredDescendantId, isElementAnchored } from '@elementor/editor-elements';
import { notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';

import { initLinkInLinkPrevention } from '../prevent-link-in-link-commands';

jest.mock( '@elementor/editor-elements', () => ( {
	getAnchoredAncestorId: jest.fn(),
	getAnchoredDescendantId: jest.fn(),
	isElementAnchored: jest.fn(),
	getAllDescendants: jest.fn( ( element: { descendants?: unknown[] } ) => [
		element,
		...( element.descendants ?? [] ),
	] ),
} ) );
jest.mock( '@elementor/editor-notifications', () => ( { notify: jest.fn() } ) );
jest.mock( '@elementor/editor-v1-adapters', () => ( { blockCommand: jest.fn() } ) );

type Condition = ( args: Record< string, unknown > ) => boolean;

const getCondition = ( command: string ): Condition => {
	const call = ( blockCommand as jest.Mock ).mock.calls.find( ( [ options ] ) => options.command === command );

	return call[ 0 ].condition;
};

const createElement = ( id: string, type: string, descendants: unknown[] = [] ) => ( {
	id,
	model: { get: ( key: string ) => ( key === 'elType' ? type : undefined ) },
	descendants,
} );

describe( 'link in link prevention for the menu', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( isElementAnchored as jest.Mock ).mockReturnValue( false );
		( getAnchoredDescendantId as jest.Mock ).mockReturnValue( null );
		( getAnchoredAncestorId as jest.Mock ).mockReturnValue( null );
		initLinkInLinkPrevention();
	} );

	it( 'should block creating a menu inside a linked element and notify', () => {
		// Arrange.
		( getAnchoredAncestorId as jest.Mock ).mockReturnValue( 'link-parent' );

		// Act.
		const blocked = getCondition( 'document/elements/create' )( {
			container: { id: 'target' },
			model: { elType: 'e-menu' },
		} );

		// Assert.
		expect( blocked ).toBe( true );
		expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: 'create-in-link-blocked' } ) );
	} );

	it( 'should allow creating a menu outside a link', () => {
		// Act.
		const blocked = getCondition( 'document/elements/create' )( {
			container: { id: 'target' },
			model: { elType: 'e-menu' },
		} );

		// Assert.
		expect( blocked ).toBe( false );
		expect( notify ).not.toHaveBeenCalled();
	} );

	it( 'should allow creating other elements inside a link', () => {
		// Arrange.
		( getAnchoredAncestorId as jest.Mock ).mockReturnValue( 'link-parent' );

		// Act.
		const blocked = getCondition( 'document/elements/create' )( {
			container: { id: 'target' },
			model: { widgetType: 'e-heading' },
		} );

		// Assert.
		expect( blocked ).toBe( false );
	} );

	it( 'should block moving an element that contains a menu into a linked element', () => {
		// Arrange.
		( isElementAnchored as jest.Mock ).mockImplementation( ( id: string ) => id === 'target' );
		const source = createElement( 'source', 'e-div-block', [ createElement( 'menu', 'e-menu' ) ] );

		// Act.
		const blocked = getCondition( 'document/elements/move' )( {
			containers: [ source ],
			target: { id: 'target' },
		} );

		// Assert.
		expect( blocked ).toBe( true );
		expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: 'move-in-link-blocked' } ) );
	} );

	it( 'should allow moving a menu into an element without a link', () => {
		// Arrange.
		const source = createElement( 'menu', 'e-menu' );

		// Act.
		const blocked = getCondition( 'document/elements/move' )( {
			containers: [ source ],
			target: { id: 'target' },
		} );

		// Assert.
		expect( blocked ).toBe( false );
	} );

	it( 'should block pasting a copied menu into a linked element', () => {
		// Arrange.
		( getAnchoredAncestorId as jest.Mock ).mockReturnValue( 'link-parent' );
		( window as unknown as { elementorCommon: unknown } ).elementorCommon = {
			storage: {
				get: () => ( { clipboard: { elements: [ { id: 'copied', elType: 'e-menu' } ] } } ),
			},
		};

		// Act.
		const blocked = getCondition( 'document/elements/paste' )( {
			container: { id: 'target' },
			storageType: 'localstorage',
		} );

		// Assert.
		expect( blocked ).toBe( true );
		expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { id: 'paste-in-link-blocked' } ) );
	} );
} );
