import {
	cleanupClosedStructureFixture,
	type ClosedStructureFixture,
	setupClosedStructureFixture,
} from '../../closed-structure/__tests__/closed-structure-fixture';
import { findWidgetPart } from '../find-widget-part';

describe( 'findWidgetPart', () => {
	let fixture: ClosedStructureFixture;

	beforeEach( () => {
		fixture = setupClosedStructureFixture();
	} );

	afterEach( () => {
		cleanupClosedStructureFixture();
	} );

	it( 'should return the root for the root part', () => {
		// Act
		const part = findWidgetPart( fixture.root, 'root' );

		// Assert
		expect( part ).toBe( fixture.root );
	} );

	it( 'should return a part of the widget structure, including a slot', () => {
		// Act
		const label = findWidgetPart( fixture.root, 'label' );
		const slot = findWidgetPart( fixture.root, 'tab_content' );

		// Assert
		expect( label ).toBe( fixture.label );
		expect( slot ).toBe( fixture.slot );
	} );

	it( 'should ignore parts of a nested widget inside a slot', () => {
		// Arrange
		fixture.label.model.set( 'part', 'title' );

		// Act
		const part = findWidgetPart( fixture.root, 'label' );

		// Assert
		expect( part ).toBeNull();
	} );

	it( 'should return null for a part that is not in the structure', () => {
		// Act
		const part = findWidgetPart( fixture.root, 'icon' );

		// Assert
		expect( part ).toBeNull();
	} );
} );
