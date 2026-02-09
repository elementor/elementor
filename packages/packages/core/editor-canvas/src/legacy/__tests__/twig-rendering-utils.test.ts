import {
	type ChildrenCollection,
	collectChildrenRenderPromises,
	createRenderCacheState,
	renderChildrenWithOptimization,
} from '../twig-rendering-utils';

describe( 'twig-rendering-utils', () => {
	describe( 'createRenderCacheState', () => {
		it( 'should initialize with empty state and reset on invalidate', () => {
			// Act
			const state = createRenderCacheState();

			// Assert
			expect( state.lastResolvedSettingsHash ).toBeNull();
			expect( state.domUpdateWasSkipped ).toBe( false );

			// Arrange
			state.lastResolvedSettingsHash = 'test-hash';
			state.domUpdateWasSkipped = true;

			// Act
			state.invalidate();

			// Assert
			expect( state.lastResolvedSettingsHash ).toBeNull();
			expect( state.domUpdateWasSkipped ).toBe( false );
		} );
	} );

	describe( 'collectChildrenRenderPromises', () => {
		it( 'should return empty array when children is undefined', () => {
			expect( collectChildrenRenderPromises( undefined ) ).toEqual( [] );
		} );

		it( 'should collect only existing render promises from children', () => {
			// Arrange
			const promise1 = Promise.resolve();
			const promise2 = Promise.resolve();

			const children = createMockChildren( [
				{ _currentRenderPromise: promise1 },
				{ _currentRenderPromise: undefined },
				{ _currentRenderPromise: promise2 },
			] );

			// Act
			const result = collectChildrenRenderPromises( children );

			// Assert
			expect( result ).toEqual( [ promise1, promise2 ] );
		} );
	} );

	describe( 'renderChildrenWithOptimization', () => {
		it( 'should render new children when DOM was not skipped', () => {
			// Arrange
			const renderNewChildren = jest.fn();

			// Act
			renderChildrenWithOptimization( {
				children: createMockChildren( [] ),
				domUpdateWasSkipped: false,
				renderNewChildren,
			} );

			// Assert
			expect( renderNewChildren ).toHaveBeenCalled();
		} );

		it( 'should rerender existing children when DOM update was skipped', () => {
			// Arrange
			const renderNewChildren = jest.fn();
			const childView1 = { render: jest.fn() };
			const childView2 = { render: jest.fn() };

			// Act
			renderChildrenWithOptimization( {
				children: createMockChildren( [ childView1, childView2 ] ),
				domUpdateWasSkipped: true,
				renderNewChildren,
			} );

			// Assert
			expect( renderNewChildren ).not.toHaveBeenCalled();
			expect( childView1.render ).toHaveBeenCalled();
			expect( childView2.render ).toHaveBeenCalled();
		} );

		it( 'should fall back to renderNewChildren when skipped but no children exist', () => {
			// Arrange
			const renderNewChildren = jest.fn();

			// Act
			renderChildrenWithOptimization( {
				children: undefined,
				domUpdateWasSkipped: true,
				renderNewChildren,
			} );

			// Assert
			expect( renderNewChildren ).toHaveBeenCalled();
		} );
	} );
} );

function createMockChildren( items: Record< string, unknown >[] ): ChildrenCollection {
	return {
		length: items.length,
		findByIndex: jest.fn(),
		each: jest.fn( ( callback ) => {
			items.forEach( ( item ) => callback( item ) );
		} ),
	} as unknown as ChildrenCollection;
}
