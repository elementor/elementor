import { createMockStyleDefinition } from 'test-utils';

import { type GlobalClasses } from '../store';
import { calculateChanges } from '../utils/calculate-changes';
import { rebaseLocalChanges } from '../utils/rebase-local-changes';

const classOf = ( id: string, label = id ) => createMockStyleDefinition( { id, label } );

const stateOf = (
	classes: ReturnType< typeof classOf >[],
	order = classes.map( ( { id } ) => id )
): GlobalClasses => ( {
	items: Object.fromEntries( classes.map( ( item ) => [ item.id, item ] ) ),
	order,
} );

describe( 'rebaseLocalChanges', () => {
	it( 'should leave nothing to save when the user made no edits', () => {
		// Arrange
		const base = stateOf( [ classOf( 'a' ), classOf( 'b' ) ] );
		const server = stateOf( [ classOf( 'a', 'A on server' ), classOf( 'b' ) ] );

		// Act
		const { data, baseline } = rebaseLocalChanges( base, base, server );

		// Assert
		expect( calculateChanges( data, baseline ) ).toEqual( { added: [], deleted: [], modified: [], order: false } );
		expect( data.items.a.label ).toBe( 'A on server' );
	} );

	it( 'should keep the classes the user added, edited and deleted as the only changes', () => {
		// Arrange
		const base = stateOf( [ classOf( 'a' ), classOf( 'b' ), classOf( 'c' ) ] );
		const local = stateOf( [ classOf( 'new' ), classOf( 'a', 'Edited' ), classOf( 'c' ) ] );
		const server = stateOf( [ classOf( 'a' ), classOf( 'b' ), classOf( 'c' ) ] );

		// Act
		const { data, baseline } = rebaseLocalChanges( base, local, server );

		// Assert
		expect( calculateChanges( data, baseline ) ).toEqual( {
			added: [ 'new' ],
			deleted: [ 'b' ],
			modified: [ 'a' ],
			order: true,
		} );
		expect( data.order ).toEqual( [ 'new', 'a', 'c' ] );
	} );

	it( 'should keep a class another session added, and not treat it as deleted', () => {
		// Arrange
		const base = stateOf( [ classOf( 'a' ) ] );
		const local = stateOf( [ classOf( 'a', 'Edited' ) ] );
		const server = stateOf( [ classOf( 'a' ), classOf( 'elsewhere' ) ], [ 'elsewhere', 'a' ] );

		// Act
		const { data, baseline } = rebaseLocalChanges( base, local, server );

		// Assert
		expect( data.order ).toEqual( [ 'elsewhere', 'a' ] );
		expect( data.items ).toHaveProperty( 'elsewhere' );
		expect( calculateChanges( data, baseline ) ).toEqual( {
			added: [],
			deleted: [],
			modified: [ 'a' ],
			order: false,
		} );
	} );

	it( 'should keep a class another session removed as removed when the user did not touch it', () => {
		// Arrange
		const base = stateOf( [ classOf( 'a' ), classOf( 'b' ) ] );
		const server = stateOf( [ classOf( 'a' ) ] );

		// Act
		const { data, baseline } = rebaseLocalChanges( base, base, server );

		// Assert
		expect( data.order ).toEqual( [ 'a' ] );
		expect( data.items ).not.toHaveProperty( 'b' );
		expect( calculateChanges( data, baseline ).deleted ).toEqual( [] );
	} );

	it( 'should save a class the user edited again when another session removed it', () => {
		// Arrange
		const base = stateOf( [ classOf( 'a' ), classOf( 'b' ) ] );
		const local = stateOf( [ classOf( 'a' ), classOf( 'b', 'Edited' ) ] );
		const server = stateOf( [ classOf( 'a' ) ] );

		// Act
		const { data, baseline } = rebaseLocalChanges( base, local, server );

		// Assert
		expect( data.order ).toEqual( [ 'a', 'b' ] );
		expect( calculateChanges( data, baseline ).added ).toEqual( [ 'b' ] );
	} );

	it( 'should keep a class the server does not have yet after the class it follows locally', () => {
		// Arrange - X was added as a draft between A and B, and was never published.
		const base = stateOf( [ classOf( 'a' ), classOf( 'b' ) ] );
		const local = stateOf( [ classOf( 'a' ), classOf( 'x' ), classOf( 'b' ) ], [ 'a', 'x', 'b' ] );
		const server = stateOf( [ classOf( 'a' ), classOf( 'b' ), classOf( 'y' ) ], [ 'a', 'b', 'y' ] );

		// Act
		const { data, baseline } = rebaseLocalChanges( base, local, server );

		// Assert
		expect( data.order ).toEqual( [ 'a', 'x', 'b', 'y' ] );
		expect( calculateChanges( data, baseline ).added ).toEqual( [ 'x' ] );
	} );

	it( 'should place a new class after the nearest earlier class that is still there', () => {
		// Arrange - the class before X was removed by another session.
		const base = stateOf( [ classOf( 'a' ), classOf( 'b' ) ] );
		const local = stateOf( [ classOf( 'a' ), classOf( 'b' ), classOf( 'x' ) ], [ 'a', 'b', 'x' ] );
		const server = stateOf( [ classOf( 'a' ), classOf( 'c' ) ], [ 'a', 'c' ] );

		// Act
		const { data } = rebaseLocalChanges( base, local, server );

		// Assert
		expect( data.order ).toEqual( [ 'a', 'x', 'c' ] );
	} );

	it( 'should keep the order the user chose and put classes from other sessions first', () => {
		// Arrange
		const base = stateOf( [ classOf( 'a' ), classOf( 'b' ), classOf( 'c' ) ] );
		const local = stateOf( [ classOf( 'a' ), classOf( 'b' ), classOf( 'c' ) ], [ 'c', 'a', 'b' ] );
		const server = stateOf(
			[ classOf( 'a' ), classOf( 'b' ), classOf( 'c' ), classOf( 'elsewhere' ) ],
			[ 'a', 'b', 'c', 'elsewhere' ]
		);

		// Act
		const { data, baseline } = rebaseLocalChanges( base, local, server );

		// Assert
		expect( data.order ).toEqual( [ 'elsewhere', 'c', 'a', 'b' ] );
		expect( calculateChanges( data, baseline ) ).toEqual( {
			added: [],
			deleted: [],
			modified: [],
			order: true,
		} );
	} );

	it( 'should keep the lazily loaded classes out of the changes', () => {
		// Arrange - class b is in the order but its definition was never loaded.
		const base: GlobalClasses = { items: { a: classOf( 'a' ) }, order: [ 'a', 'b' ] };
		const server: GlobalClasses = { items: { a: classOf( 'a' ) }, order: [ 'a', 'b' ] };

		// Act
		const { data, baseline } = rebaseLocalChanges( base, base, server );

		// Assert
		expect( calculateChanges( data, baseline ) ).toEqual( { added: [], deleted: [], modified: [], order: false } );
	} );
} );
