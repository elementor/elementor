import { createMockChild, createMockContainer } from 'test-utils';

import { getContainer } from '../get-container';
import {
	addModelToParent,
	findAtomicAncestorId,
	findModelInDocTree,
	removeModelFromParent,
	rerenderAncestor,
	resolveContainer,
} from '../resolve-element';

jest.mock( '../get-container' );

const mockGetContainer = jest.mocked( getContainer );

type MockBackboneModel = {
	get: jest.Mock;
	set: jest.Mock;
	toJSON: jest.Mock;
	__elements: {
		models: MockBackboneModel[];
		add: jest.Mock;
		remove: jest.Mock;
		findWhere: jest.Mock;
	};
};

function createBackboneModel( id: string, children: MockBackboneModel[] = [] ): MockBackboneModel {
	const elements = {
		models: children,
		add: jest.fn(),
		remove: jest.fn(),
		findWhere: jest.fn( ( attrs: Record< string, unknown > ) =>
			children.find( ( c: MockBackboneModel ) => c.get( 'id' ) === attrs.id )
		),
	};

	return {
		get: jest.fn( ( key: string ) => {
			if ( key === 'id' ) {
				return id;
			}
			if ( key === 'elements' ) {
				return elements;
			}
			return undefined;
		} ),
		set: jest.fn(),
		toJSON: jest.fn( () => ( { id } ) ),
		__elements: elements,
	};
}

function setupFindModelById( models: MockBackboneModel[] ) {
	const findModelById: jest.Mock = jest.fn( ( id: string, collection?: { models: unknown[] } ) => {
		const items = collection ? ( collection.models as MockBackboneModel[] ) : models;

		for ( const model of items ) {
			if ( model.get( 'id' ) === id ) {
				return model;
			}

			const childElements = model.__elements;

			if ( childElements?.models?.length ) {
				const found = findModelById( id, childElements );

				if ( found ) {
					return found;
				}
			}
		}

		return null;
	} );

	( window as unknown as Record< string, unknown > ).$e = {
		components: {
			get: () => ( {
				utils: { findModelById },
			} ),
		},
	};

	return findModelById;
}

describe( 'resolve-element utilities', () => {
	beforeEach( () => {
		mockGetContainer.mockClear();
	} );

	afterEach( () => {
		delete ( window as unknown as Record< string, unknown > ).$e;
		delete ( window as unknown as Record< string, unknown > ).elementor;
	} );

	describe( 'resolveContainer', () => {
		it( 'should return looked up container when view is connected', () => {
			// Arrange
			const container = createMockChild( { id: 'el-1', elType: 'widget' } );
			const connectedEl = document.createElement( 'div' );
			document.body.appendChild( connectedEl );
			const lookedUp = { ...container, view: { el: connectedEl } };
			container.lookup = jest.fn( () => lookedUp );

			// Act
			const result = resolveContainer( container, 'el-1' );

			// Assert
			expect( result ).toBe( lookedUp );
			expect( mockGetContainer ).not.toHaveBeenCalled();

			document.body.removeChild( connectedEl );
		} );

		it( 'should fall back to getContainer when lookup returns stale ref', () => {
			// Arrange
			const container = createMockChild( { id: 'el-1', elType: 'widget' } );
			const disconnectedEl = document.createElement( 'div' );
			container.lookup = jest.fn( () => ( { ...container, view: { el: disconnectedEl } } ) );

			const connectedEl = document.createElement( 'div' );
			document.body.appendChild( connectedEl );
			const freshContainer = { ...container, view: { el: connectedEl } };
			mockGetContainer.mockReturnValue( freshContainer );

			// Act
			const result = resolveContainer( container, 'el-1' );

			// Assert
			expect( result ).toBe( freshContainer );
			expect( mockGetContainer ).toHaveBeenCalledWith( 'el-1' );

			document.body.removeChild( connectedEl );
		} );

		it( 'should return null when both lookup and getContainer fail', () => {
			// Arrange
			const container = createMockChild( { id: 'el-1', elType: 'widget' } );
			const disconnectedEl = document.createElement( 'div' );
			container.lookup = jest.fn( () => ( { ...container, view: { el: disconnectedEl } } ) );
			mockGetContainer.mockReturnValue( null );

			// Act
			const result = resolveContainer( container, 'el-1' );

			// Assert
			expect( result ).toBeNull();
		} );
	} );

	describe( 'findModelInDocTree', () => {
		it( 'should find a model at root level', () => {
			// Arrange
			const rootModel = createBackboneModel( 'root-1' );
			setupFindModelById( [ rootModel ] );

			// Act
			const result = findModelInDocTree( 'root-1' );

			// Assert
			expect( result ).toBeTruthy();
			expect( result?.get( 'id' ) ).toBe( 'root-1' );
		} );

		it( 'should find a deeply nested model', () => {
			// Arrange
			const grandchild = createBackboneModel( 'grandchild-1' );
			const child = createBackboneModel( 'child-1', [ grandchild ] );
			const root = createBackboneModel( 'root-1', [ child ] );
			setupFindModelById( [ root ] );

			// Act
			const result = findModelInDocTree( 'grandchild-1' );

			// Assert
			expect( result ).toBeTruthy();
			expect( result?.get( 'id' ) ).toBe( 'grandchild-1' );
		} );

		it( 'should return null when model not found', () => {
			// Arrange
			const root = createBackboneModel( 'root-1' );
			setupFindModelById( [ root ] );

			// Act
			const result = findModelInDocTree( 'nonexistent' );

			// Assert
			expect( result ).toBeNull();
		} );

		it( 'should return null when $e is not available', () => {
			// Arrange (no $e setup)

			// Act
			const result = findModelInDocTree( 'any-id' );

			// Assert
			expect( result ).toBeNull();
		} );
	} );

	describe( 'addModelToParent', () => {
		it( 'should add child model to parent elements collection', () => {
			// Arrange
			const parent = createBackboneModel( 'parent-1' );
			setupFindModelById( [ parent ] );
			const childData = { id: 'child-1', elType: 'widget' };

			// Act
			const result = addModelToParent( 'parent-1', childData );

			// Assert
			expect( result ).toBe( true );
			expect( parent.__elements.add ).toHaveBeenCalledWith( childData, { at: undefined, silent: true } );
		} );

		it( 'should add child model at specific position', () => {
			// Arrange
			const parent = createBackboneModel( 'parent-1' );
			setupFindModelById( [ parent ] );
			const childData = { id: 'child-1', elType: 'widget' };

			// Act
			const result = addModelToParent( 'parent-1', childData, { at: 2 } );

			// Assert
			expect( result ).toBe( true );
			expect( parent.__elements.add ).toHaveBeenCalledWith( childData, { at: 2, silent: true } );
		} );

		it( 'should return false when parent model not found', () => {
			// Arrange
			setupFindModelById( [] );

			// Act
			const result = addModelToParent( 'nonexistent', { id: 'child-1' } );

			// Assert
			expect( result ).toBe( false );
		} );
	} );

	describe( 'removeModelFromParent', () => {
		it( 'should remove child model from parent elements collection', () => {
			// Arrange
			const child = createBackboneModel( 'child-1' );
			const parent = createBackboneModel( 'parent-1', [ child ] );
			setupFindModelById( [ parent ] );

			// Act
			const result = removeModelFromParent( 'parent-1', 'child-1' );

			// Assert
			expect( result ).toBe( true );
			expect( parent.__elements.remove ).toHaveBeenCalledWith( child, { silent: true } );
		} );

		it( 'should return false when child model not found in parent', () => {
			// Arrange
			const parent = createBackboneModel( 'parent-1' );
			setupFindModelById( [ parent ] );

			// Act
			const result = removeModelFromParent( 'parent-1', 'nonexistent-child' );

			// Assert
			expect( result ).toBe( false );
			expect( parent.__elements.remove ).not.toHaveBeenCalled();
		} );

		it( 'should return false when parent model not found', () => {
			// Arrange
			setupFindModelById( [] );

			// Act
			const result = removeModelFromParent( 'nonexistent', 'child-1' );

			// Assert
			expect( result ).toBe( false );
		} );
	} );

	describe( 'rerenderAncestor', () => {
		it( 'should call render on the ancestor view', () => {
			// Arrange
			const mockRender = jest.fn();
			const ancestor = createMockContainer( 'ancestor-1', [] );
			ancestor.view = {
				el: document.createElement( 'div' ),
				render: mockRender,
			} as unknown as typeof ancestor.view;
			mockGetContainer.mockReturnValue( ancestor );

			// Act
			rerenderAncestor( 'ancestor-1' );

			// Assert
			expect( mockRender ).toHaveBeenCalled();
		} );

		it( 'should not throw when ancestorId is undefined', () => {
			// Act & Assert
			expect( () => rerenderAncestor( undefined ) ).not.toThrow();
			expect( mockGetContainer ).not.toHaveBeenCalled();
		} );

		it( 'should not throw when ancestor container not found', () => {
			// Arrange
			mockGetContainer.mockReturnValue( null );

			// Act & Assert
			expect( () => rerenderAncestor( 'missing-id' ) ).not.toThrow();
		} );
	} );

	describe( 'findAtomicAncestorId', () => {
		it( 'should return the id of the nearest atomic ancestor', () => {
			// Arrange
			const grandparent = createMockContainer( 'tabs-widget', [] );
			const parent = createMockContainer( 'tabs-menu', [] );
			const child = createMockChild( { id: 'tab-1', elType: 'e-tab' } );

			parent.parent = grandparent;
			child.parent = parent;

			( window as unknown as Record< string, unknown > ).elementor = {
				helpers: {
					isAtomicWidget: jest.fn( ( model: { get: ( k: string ) => string } ) => {
						return model.get( 'id' ) === 'tabs-widget';
					} ),
				},
			};

			// Act
			const result = findAtomicAncestorId( child );

			// Assert
			expect( result ).toBe( 'tabs-widget' );
		} );

		it( 'should return undefined when no atomic ancestor exists', () => {
			// Arrange
			const parent = createMockContainer( 'regular-container', [] );
			const child = createMockChild( { id: 'el-1', elType: 'widget' } );
			child.parent = parent;

			( window as unknown as Record< string, unknown > ).elementor = {
				helpers: {
					isAtomicWidget: jest.fn( () => false ),
				},
			};

			// Act
			const result = findAtomicAncestorId( child );

			// Assert
			expect( result ).toBeUndefined();
		} );

		it( 'should return undefined when elementor helpers not available', () => {
			// Arrange
			const child = createMockChild( { id: 'el-1', elType: 'widget' } );

			// Act
			const result = findAtomicAncestorId( child );

			// Assert
			expect( result ).toBeUndefined();
		} );
	} );
} );
