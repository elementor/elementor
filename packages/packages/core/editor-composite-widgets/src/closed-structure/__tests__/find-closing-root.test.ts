import { findClosingRoot } from '../find-closing-root';
import {
	cleanupClosedStructureFixture,
	type ClosedStructureFixture,
	setupClosedStructureFixture,
} from './closed-structure-fixture';

describe( 'findClosingRoot', () => {
	let fixture: ClosedStructureFixture;

	beforeEach( () => {
		fixture = setupClosedStructureFixture();
	} );

	afterEach( () => {
		cleanupClosedStructureFixture();
	} );

	it.each( [
		[ 'a part', 'label', false, 'root' ],
		[ 'the slot itself', 'slot', false, 'root' ],
		[ 'the widget root as a target', 'root', true, 'root' ],
		[ 'a part inside a nested widget', 'nestedPart', false, 'nestedRoot' ],
	] as const )( 'closes %s', ( _, elementKey, includeSelf, rootKey ) => {
		// Act.
		const result = findClosingRoot( fixture[ elementKey ], { includeSelf } );

		// Assert.
		expect( result ).toBe( fixture[ rootKey ] );
	} );

	it.each( [
		[ 'the widget root itself', 'root', false ],
		[ 'the slot as a target', 'slot', true ],
		[ 'slot content', 'slotChild', false ],
		[ 'a nested widget root inside a slot', 'nestedRoot', false ],
		[ 'a page element', 'page', true ],
		[ 'a part of a widget whose definition is not registered', 'unknownPart', false ],
	] as const )( 'leaves %s open', ( _, elementKey, includeSelf ) => {
		// Act.
		const result = findClosingRoot( fixture[ elementKey ], { includeSelf } );

		// Assert.
		expect( result ).toBeNull();
	} );
} );
