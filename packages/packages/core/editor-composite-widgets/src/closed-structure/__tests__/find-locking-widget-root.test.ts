import { findClosestContainer } from '@elementor/editor-elements';

import { isElementLocked, isInsertionLocked } from '../find-locking-widget-root';
import {
	cleanupClosedStructureFixture,
	type ClosedStructureFixture,
	getContainerSpy,
	setupClosedStructureFixture,
} from './closed-structure-fixture';

jest.mock( '@elementor/editor-elements', () => {
	const actual = jest.requireActual( '@elementor/editor-elements' );

	return { ...actual, findClosestContainer: jest.fn( actual.findClosestContainer ) };
} );

describe( 'find-locking-widget-root', () => {
	let fixture: ClosedStructureFixture;

	beforeEach( () => {
		fixture = setupClosedStructureFixture();
		jest.mocked( findClosestContainer ).mockClear();
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
			[ 'an unnamed node inside a widget, which definitions reject', 'unnamedNode' ],
		] as const )( 'leaves %s unlocked', ( _, elementKey ) => {
			// Act.
			const result = isElementLocked( fixture[ elementKey ] );

			// Assert.
			expect( result ).toBe( false );
		} );
	} );

	describe( 'element lookups', () => {
		it.each( [
			[ 'a part', 'label' ],
			[ 'slot content', 'slotChild' ],
			[ 'a part inside a nested widget', 'nestedPart' ],
		] as const )( 'reads the markers of %s from the model without resolving elements by id', ( _, elementKey ) => {
			// Act.
			isElementLocked( fixture[ elementKey ] );
			isInsertionLocked( fixture[ elementKey ] );

			// Assert.
			expect( getContainerSpy() ).not.toHaveBeenCalled();
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
			[ 'an unnamed node inside a widget, which definitions reject', 'unnamedNode', false ],
		] as const )( 'inserting into %s is locked: %s', ( _, targetKey, expected ) => {
			// Act.
			const result = isInsertionLocked( fixture[ targetKey ] );

			// Assert.
			expect( result ).toBe( expected );
		} );
	} );

	describe( 'elements without markers', () => {
		it.each( [
			[ 'a page element', 'page' ],
			[ 'slot content', 'slotChild' ],
		] as const )( 'skips the ancestor walk for %s', ( _, elementKey ) => {
			// Act.
			isElementLocked( fixture[ elementKey ] );
			isInsertionLocked( fixture[ elementKey ] );

			// Assert.
			expect( findClosestContainer ).not.toHaveBeenCalled();
		} );
	} );
} );
