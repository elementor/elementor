import { isElementLocked, isInsertionLocked } from '../find-locking-widget-root';
import {
	cleanupClosedStructureFixture,
	type ClosedStructureFixture,
	setupClosedStructureFixture,
} from './closed-structure-fixture';

describe( 'find-locking-widget-root', () => {
	let fixture: ClosedStructureFixture;

	beforeEach( () => {
		fixture = setupClosedStructureFixture();
	} );

	afterEach( () => {
		cleanupClosedStructureFixture();
	} );

	describe( 'isElementLocked', () => {
		it.each( [
			[ 'a part', 'label' ],
			[ 'the slot itself', 'slot' ],
			[ 'a part inside a nested widget', 'nestedPart' ],
		] as const )( 'locks %s', ( _, elementKey ) => {
			// Act.
			const result = isElementLocked( fixture[ elementKey ] );

			// Assert.
			expect( result ).toBe( true );
		} );

		it.each( [
			[ 'the widget root itself', 'root' ],
			[ 'slot content', 'slotChild' ],
			[ 'a nested widget root inside a slot', 'nestedRoot' ],
			[ 'a page element', 'page' ],
			[ 'a part of a widget whose definition is not registered', 'unknownPart' ],
		] as const )( 'leaves %s unlocked', ( _, elementKey ) => {
			// Act.
			const result = isElementLocked( fixture[ elementKey ] );

			// Assert.
			expect( result ).toBe( false );
		} );
	} );

	describe( 'isInsertionLocked', () => {
		it.each( [
			[ 'the widget root', 'root', true ],
			[ 'a part', 'label', true ],
			[ 'the slot', 'slot', false ],
			[ 'slot content', 'slotChild', false ],
			[ 'the page', 'page', false ],
			[ 'a widget whose definition is not registered', 'unknownRoot', false ],
		] as const )( 'inserting into %s is locked: %s', ( _, targetKey, expected ) => {
			// Act.
			const result = isInsertionLocked( fixture[ targetKey ] );

			// Assert.
			expect( result ).toBe( expected );
		} );
	} );
} );
