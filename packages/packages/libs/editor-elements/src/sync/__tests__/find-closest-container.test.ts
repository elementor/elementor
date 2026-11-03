import { findClosestContainer } from '../find-closest-container';
import { type V1Element } from '../types';

const makeContainer = ( id: string, parent?: V1Element ) => ( { id, parent } ) as unknown as V1Element;

describe( 'findClosestContainer', () => {
	it( 'should return the start container when it matches the predicate', () => {
		// Arrange
		const parent = makeContainer( 'parent' );
		const child = makeContainer( 'child', parent );

		// Act
		const result = findClosestContainer( child, () => true );

		// Assert
		expect( result ).toBe( child );
	} );

	it( 'should return the nearest matching ancestor', () => {
		// Arrange
		const root = makeContainer( 'root' );
		const nearest = makeContainer( 'nearest', root );
		const child = makeContainer( 'child', nearest );

		// Act
		const result = findClosestContainer( child, ( container ) => container.id !== 'child' );

		// Assert
		expect( result ).toBe( nearest );
	} );

	it( 'should return null when no container matches', () => {
		// Arrange
		const child = makeContainer( 'child', makeContainer( 'parent' ) );

		// Act
		const result = findClosestContainer( child, () => false );

		// Assert
		expect( result ).toBeNull();
	} );

	it( 'should return null when there is no start container', () => {
		// Act
		const result = findClosestContainer( undefined, () => true );

		// Assert
		expect( result ).toBeNull();
	} );
} );
