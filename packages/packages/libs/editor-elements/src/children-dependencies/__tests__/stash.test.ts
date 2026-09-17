import { type V1ElementData } from '../../sync/types';
import { createChildrenStash } from '../stash';

describe( 'createChildrenStash', () => {
	beforeEach( () => {
		sessionStorage.clear();
	} );

	it( 'round-trips data via session storage', () => {
		// Arrange.
		const stash = createChildrenStash();
		const data = { elType: 'e-pagination', id: 'pag-1' } as V1ElementData;

		// Act.
		stash.save( 'parent-1', 'e-pagination', data );

		// Assert.
		expect( stash.get( 'parent-1', 'e-pagination' ) ).toEqual( data );
	} );

	it( 'returns undefined when nothing has been stashed for the key', () => {
		const stash = createChildrenStash();

		expect( stash.get( 'parent-1', 'e-pagination' ) ).toBeUndefined();
	} );

	it( 'clears one entry without affecting other keys', () => {
		// Arrange.
		const stash = createChildrenStash();
		stash.save( 'parent-1', 'e-pagination', { elType: 'e-pagination' } as V1ElementData );
		stash.save( 'parent-2', 'e-pagination', { elType: 'e-pagination' } as V1ElementData );

		// Act.
		stash.clear( 'parent-1', 'e-pagination' );

		// Assert.
		expect( stash.get( 'parent-1', 'e-pagination' ) ).toBeUndefined();
		expect( stash.get( 'parent-2', 'e-pagination' ) ).toBeDefined();
	} );

	it( 'clearAllForElement removes every child-type stash under a given parent', () => {
		// Arrange.
		const stash = createChildrenStash();
		stash.save( 'parent-1', 'e-pagination', { elType: 'e-pagination' } as V1ElementData );
		stash.save( 'parent-1', 'e-header', { elType: 'e-header' } as V1ElementData );
		stash.save( 'parent-2', 'e-pagination', { elType: 'e-pagination' } as V1ElementData );

		// Act.
		stash.clearAllForElement( 'parent-1' );

		// Assert.
		expect( stash.get( 'parent-1', 'e-pagination' ) ).toBeUndefined();
		expect( stash.get( 'parent-1', 'e-header' ) ).toBeUndefined();
		expect( stash.get( 'parent-2', 'e-pagination' ) ).toBeDefined();
	} );
} );
