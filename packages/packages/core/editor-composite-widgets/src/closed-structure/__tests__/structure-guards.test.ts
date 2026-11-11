import { createHooksRegistry, setupHooksRegistry, type WindowWithHooks } from 'test-utils';
import { notify } from '@elementor/editor-notifications';

import { initStructureGuards } from '../structure-guards';
import { runWidgetStructureOperation } from '../widget-structure-operation';
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

describe( 'initStructureGuards', () => {
	const hooksRegistry = createHooksRegistry();
	let fixture: ClosedStructureFixture;

	const runHook = ( command: string, args: Record< string, unknown > ) =>
		hooksRegistry.getByCommand( command )?.apply( args );

	const setCommandsTrace = ( trace: string[] ) => {
		( window as unknown as WindowWithHooks ).$e.commands = { currentTrace: trace };
	};

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

		it( 'strips orphan markers from the created model', () => {
			// Arrange.
			const args = { container: fixture.slot, model: { elType: 'e-flexbox', part: 'feature', isLocked: true } };

			// Act.
			runHook( CREATE, args );

			// Assert.
			expect( args.model ).toEqual( { elType: 'e-flexbox' } );
		} );

		it.each( [
			[ 'an undo', [ 'document/history/undo' ] ],
			[ 'a redo', [ 'document/history/redo' ] ],
			[ 'a history jump', [ 'document/history/do' ] ],
			[ 'undo all', [ 'document/history/undo-all' ] ],
			[ 'a move', [ MOVE ] ],
		] )( 'lets a create inside %s through', ( _, trace ) => {
			// Arrange.
			setCommandsTrace( trace );

			// Act.
			const result = runHook( CREATE, { container: fixture.root, model: { elType: 'e-flexbox' } } );

			// Assert.
			expect( result ).toBe( true );
		} );

		it( 'lets a widget structure operation through without stripping its parts', () => {
			// Arrange.
			const args = { container: fixture.root, model: { elType: 'widget', part: 'icon', isLocked: true } };

			// Act.
			const result = runWidgetStructureOperation( () => runHook( CREATE, args ) );

			// Assert.
			expect( result ).toBe( true );
			expect( args.model ).toEqual( { elType: 'widget', part: 'icon', isLocked: true } );
		} );
	} );

	describe( 'delete', () => {
		it( 'blocks deleting a part', () => {
			// Act.
			const result = runHook( DELETE, { container: fixture.label } );

			// Assert.
			expect( result ).toBe( false );
		} );

		it.each( [
			[ 'the widget root', [ 'root' ] ],
			[ 'a part together with its widget root', [ 'label', 'root' ] ],
			[ 'slot content', [ 'slotChild' ] ],
			[ 'a nested widget inside a slot', [ 'nestedRoot' ] ],
		] as const )( 'allows deleting %s', ( _, keys ) => {
			// Act.
			const result = runHook( DELETE, { containers: keys.map( ( key ) => fixture[ key ] ) } );

			// Assert.
			expect( result ).toBe( true );
		} );

		it( 'lets a delete inside a redo through', () => {
			// Arrange.
			setCommandsTrace( [ 'document/history/redo' ] );

			// Act.
			const result = runHook( DELETE, { container: fixture.label } );

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

	describe( 'duplicate', () => {
		it( 'blocks duplicating a part', () => {
			// Act.
			const result = runHook( DUPLICATE, { container: fixture.label } );

			// Assert.
			expect( result ).toBe( false );
		} );

		it.each( [
			[ 'the widget root', 'root' ],
			[ 'slot content', 'slotChild' ],
		] as const )( 'allows duplicating %s', ( _, elementKey ) => {
			// Act.
			const result = runHook( DUPLICATE, { container: fixture[ elementKey ] } );

			// Assert.
			expect( result ).toBe( true );
		} );
	} );
} );
