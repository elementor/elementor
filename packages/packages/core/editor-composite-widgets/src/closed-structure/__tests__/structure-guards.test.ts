import { createHooksRegistry, setupHooksRegistry, type WindowWithHooks } from 'test-utils';
import { notify } from '@elementor/editor-notifications';

import { initStructureGuards } from '../structure-guards';
import { WIDGET_STRUCTURE_ORIGIN } from '../widget-structure-origin';
import {
	cleanupClosedStructureFixture,
	type ClosedStructureFixture,
	setupClosedStructureFixture,
} from './closed-structure-fixture';

jest.mock( '@elementor/editor-notifications' );

const CREATE = 'document/elements/create';
const DELETE = 'document/elements/delete';
const MOVE = 'document/elements/move';
const PASTE = 'document/elements/paste';
const DUPLICATE = 'document/elements/duplicate';
const COPY = 'document/elements/copy';

describe( 'initStructureGuards', () => {
	const hooksRegistry = createHooksRegistry();
	let fixture: ClosedStructureFixture;

	const runHook = ( command: string, args: Record< string, unknown > ) =>
		hooksRegistry.getByCommand( command )?.apply( args );

	beforeEach( () => {
		setupHooksRegistry( hooksRegistry );
		fixture = setupClosedStructureFixture();

		initStructureGuards();
	} );

	afterEach( () => {
		cleanupClosedStructureFixture();
		jest.clearAllMocks();
	} );

	describe( 'create', () => {
		it( 'blocks creating inside a widget and notifies', () => {
			// Act.
			const result = runHook( CREATE, { container: fixture.root, model: { elType: 'e-flexbox' } } );

			// Assert.
			expect( result ).toBe( false );
			expect( notify ).toHaveBeenCalledWith(
				expect.objectContaining( { id: 'composite-widget-structure-closed' } )
			);
		} );

		it.each( [
			[ 'a slot', 'slot' ],
			[ 'slot content', 'slotChild' ],
			[ 'the page', 'page' ],
		] as const )( 'allows creating in %s', ( _, targetKey ) => {
			// Act.
			const result = runHook( CREATE, { container: fixture[ targetKey ], model: { elType: 'e-flexbox' } } );

			// Assert.
			expect( result ).toBe( true );
			expect( notify ).not.toHaveBeenCalled();
		} );

		it( 'lets a command carrying the widget structure origin through', () => {
			// Act.
			const result = runHook( CREATE, {
				container: fixture.root,
				model: { elType: 'widget', part: 'icon' },
				options: { origin: WIDGET_STRUCTURE_ORIGIN },
			} );

			// Assert.
			expect( result ).toBe( true );
		} );

		it.each( [
			[ 'an undo', [ 'document/history/undo' ] ],
			[ 'a move', [ MOVE ] ],
		] )( 'no longer lets a create inside %s through by its trace', ( _, trace ) => {
			// Arrange.
			( window as unknown as WindowWithHooks ).$e.commands = { currentTrace: trace };

			// Act.
			const result = runHook( CREATE, { container: fixture.root, model: { elType: 'e-flexbox' } } );

			// Assert.
			expect( result ).toBe( false );
		} );
	} );

	describe( 'delete', () => {
		it.each( [
			[ 'a part', [ 'label' ] ],
			[ 'a part together with its widget root', [ 'label', 'root' ] ],
			[ 'a part together with its slot content', [ 'slotChild', 'slot' ] ],
		] as const )( 'blocks deleting %s', ( _, keys ) => {
			// Act.
			const result = runHook( DELETE, { containers: keys.map( ( key ) => fixture[ key ] ) } );

			// Assert.
			expect( result ).toBe( false );
		} );

		it.each( [
			[ 'the widget root', [ 'root' ] ],
			[ 'slot content', [ 'slotChild' ] ],
			[ 'a nested widget inside a slot', [ 'nestedRoot' ] ],
		] as const )( 'allows deleting %s', ( _, keys ) => {
			// Act.
			const result = runHook( DELETE, { containers: keys.map( ( key ) => fixture[ key ] ) } );

			// Assert.
			expect( result ).toBe( true );
		} );

		it( 'lets a part removal carrying the widget structure origin through', () => {
			// Act.
			const result = runHook( DELETE, {
				container: fixture.label,
				options: { origin: WIDGET_STRUCTURE_ORIGIN },
			} );

			// Assert.
			expect( result ).toBe( true );
		} );
	} );

	describe( 'move', () => {
		it.each( [
			[ 'a part out of its widget', 'label', 'page' ],
			[ 'a page element into a widget', 'page', 'root' ],
			[ 'the slot itself', 'slot', 'page' ],
		] as const )( 'blocks moving %s', ( _, elementKey, targetKey ) => {
			// Act.
			const result = runHook( MOVE, { container: fixture[ elementKey ], target: fixture[ targetKey ] } );

			// Assert.
			expect( result ).toBe( false );
		} );

		it.each( [
			[ 'a page element into a slot', 'page', 'slot' ],
			[ 'slot content to the page', 'slotChild', 'document' ],
			[ 'the widget root', 'root', 'page' ],
		] as const )( 'allows moving %s', ( _, elementKey, targetKey ) => {
			// Act.
			const result = runHook( MOVE, { container: fixture[ elementKey ], target: fixture[ targetKey ] } );

			// Assert.
			expect( result ).toBe( true );
		} );
	} );

	describe( 'paste', () => {
		it( 'blocks pasting into a widget', () => {
			// Act.
			const result = runHook( PASTE, { containers: [ fixture.root ] } );

			// Assert.
			expect( result ).toBe( false );
		} );

		it( 'allows pasting into a slot', () => {
			// Act.
			const result = runHook( PASTE, { container: fixture.slot } );

			// Assert.
			expect( result ).toBe( true );
		} );
	} );

	describe.each( [
		[ 'duplicate', DUPLICATE ],
		[ 'copy', COPY ],
	] )( '%s', ( _, command ) => {
		it( 'blocks a part', () => {
			// Act.
			const result = runHook( command, { container: fixture.label } );

			// Assert.
			expect( result ).toBe( false );
		} );

		it.each( [
			[ 'the widget root', 'root' ],
			[ 'slot content', 'slotChild' ],
		] as const )( 'allows %s', ( __, elementKey ) => {
			// Act.
			const result = runHook( command, { container: fixture[ elementKey ] } );

			// Assert.
			expect( result ).toBe( true );
		} );
	} );
} );
