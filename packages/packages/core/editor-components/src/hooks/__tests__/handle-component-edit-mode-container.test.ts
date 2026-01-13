import { createHooksRegistry, setupHooksRegistry } from 'test-utils';
import { createElement, selectElement, type V1Element } from '@elementor/editor-elements';

import { COMPONENT_DOCUMENT_TYPE } from '../../components/consts';
import { isEditingComponent } from '../../utils/is-editing-component';
import { initHandleComponentEditModeContainer } from '../handle-component-edit-mode-container';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	createElement: jest.fn(),
	selectElement: jest.fn(),
} ) );

jest.mock( '../../utils/is-editing-component', () => ( {
	isEditingComponent: jest.fn(),
} ) );

const V4_DEFAULT_CONTAINER_TYPE = 'e-flexbox';

describe( 'initHandleComponentEditModeContainer', () => {
	const hooksRegistry = createHooksRegistry();

	beforeEach( () => {
		setupHooksRegistry( hooksRegistry );
		jest.mocked( isEditingComponent ).mockReturnValue( true );
	} );

	describe( 'initHandleTopLevelElementDelete', () => {
		it( 'should register a hook for document/elements/delete command', () => {
			// Act
			initHandleComponentEditModeContainer();

			// Assert
			const hook = hooksRegistry.getByCommand( 'document/elements/delete' );
			expect( hook ).toBeDefined();
		} );

		it( 'should create new top level container when top level element is deleted from component', () => {
			// Arrange
			jest.mocked( createElement ).mockReturnValue( { id: 'new-container-id' } as unknown as V1Element );

			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'document/elements/delete' );

			const deletedElement = createMockContainer( { id: 'deleted-element' } );
			createMockComponentContainer( [ deletedElement ] );

			// Act
			hook?.apply( { container: deletedElement }, deletedElement );

			// Assert
			expect( createElement ).toHaveBeenCalledWith( {
				containerId: 'document',
				model: { elType: V4_DEFAULT_CONTAINER_TYPE },
			} );
			expect( selectElement ).toHaveBeenCalledWith( 'new-container-id' );
		} );

		it( 'should not create new top level container when component still has children', () => {
			// Arrange
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'document/elements/delete' );

			const deletedElement = createMockContainer( { id: 'deleted-element' } );
			const remainingElement = createMockContainer( { id: 'remaining-element' } );
			createMockComponentContainer( [ deletedElement, remainingElement ] );

			// Act
			hook?.apply( { container: deletedElement }, deletedElement );

			// Assert
			expect( createElement ).not.toHaveBeenCalled();
		} );

		it( 'should not create new top level container when not in component edit mode', () => {
			// Arrange
			jest.mocked( isEditingComponent ).mockReturnValue( false );
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'document/elements/delete' );

			const deletedElement = createMockContainer( { id: 'deleted-element' } );
			createMockComponentContainer( [ deletedElement ] );

			// Act
			hook?.apply( { container: deletedElement }, deletedElement );

			// Assert
			expect( createElement ).not.toHaveBeenCalled();
		} );

		it( 'should not create new top level container when parent is not a component', () => {
			// Arrange
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'document/elements/delete' );

			const parent = createMockContainer( { id: 'regular-container', children: [] } );
			const deletedElement = createMockContainer( { id: 'deleted-element', parent } );

			// Act
			hook?.apply( { container: deletedElement }, deletedElement );

			// Assert
			expect( createElement ).not.toHaveBeenCalled();
		} );

		it( 'should handle containers array', () => {
			// Arrange
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'document/elements/delete' );

			const deletedElement1 = createMockContainer( { id: 'deleted-1' } );
			const deletedElement2 = createMockContainer( { id: 'deleted-2' } );
			createMockComponentContainer( [ deletedElement1 ] );

			// Act
			hook?.apply( { containers: [ deletedElement1, deletedElement2 ] }, [ deletedElement1, deletedElement2 ] );

			// Assert
			expect( createElement ).toHaveBeenCalledTimes( 1 );
			expect( createElement ).toHaveBeenCalledWith( {
				containerId: 'document',
				model: { elType: V4_DEFAULT_CONTAINER_TYPE },
			} );
		} );
	} );

	describe( 'initRedirectDropIntoComponent', () => {
		it( 'should register a hook for preview/drop command', () => {
			// Act
			initHandleComponentEditModeContainer();

			// Assert
			const hook = hooksRegistry.getByCommand( 'preview/drop' );
			expect( hook ).toBeDefined();
		} );

		it( 'should redirect drop to top level element when dropping on component', () => {
			// Arrange
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'preview/drop' );

			const topLevelElement = createMockContainer( { id: 'top-level-element' } );
			const component = createMockComponentContainer( [ topLevelElement ] );
			const args = { container: component };

			// Act
			const result = hook?.apply( args, null );

			// Assert
			expect( result ).toBe( true );
			expect( args.container ).toBe( topLevelElement );
		} );

		it( 'should not redirect when component has no children', () => {
			// Arrange
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'preview/drop' );

			const component = createMockComponentContainer( [] );
			const args = { container: component };

			// Act
			const result = hook?.apply( args, null );

			// Assert
			expect( result ).toBe( true );
			expect( args.container ).toBe( component );
		} );

		it( 'should not redirect when not editing a component', () => {
			// Arrange
			jest.mocked( isEditingComponent ).mockReturnValue( false );
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'preview/drop' );

			const topLevelElement = createMockContainer( { id: 'top-level-element' } );
			const component = createMockComponentContainer( [ topLevelElement ] );
			const args = { container: component };

			// Act
			const result = hook?.apply( args, null );

			// Assert
			expect( result ).toBe( true );
			expect( args.container ).toBe( component );
		} );

		it( 'should not redirect when container is not a component', () => {
			// Arrange
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'preview/drop' );

			const regularContainer = createMockContainer( { id: 'regular-container' } );
			const args = { container: regularContainer };

			// Act
			const result = hook?.apply( args, null );

			// Assert
			expect( result ).toBe( true );
			expect( args.container ).toBe( regularContainer );
		} );

		it( 'should handle containers array and redirect each component', () => {
			// Arrange
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'preview/drop' );

			const topLevelElement1 = createMockContainer( { id: 'top-level-1' } );
			const component1 = createMockComponentContainer( [ topLevelElement1 ] );

			const topLevelElement2 = createMockContainer( { id: 'top-level-2' } );
			const component2 = createMockComponentContainer( [ topLevelElement2 ] );

			const args = { containers: [ component1, component2 ] };

			// Act
			const result = hook?.apply( args, null );

			// Assert
			expect( result ).toBe( true );
			expect( args.containers[ 0 ] ).toBe( topLevelElement1 );
			expect( args.containers[ 1 ] ).toBe( topLevelElement2 );
		} );
	} );
} );

type MockContainer = {
	id: string;
	document: { config: { type: string } };
	parent: MockContainer | null;
	children: MockContainer[];
};

function createMockContainer( elementData: Partial< MockContainer > = {} ): MockContainer {
	return {
		id: 'element-id',
		document: { config: { type: 'page' } },
		parent: null,
		children: [],
		...elementData,
	};
}

function createMockComponentContainer( children: MockContainer[] = [] ): MockContainer {
	const component: MockContainer = {
		id: 'document',
		document: { config: { type: COMPONENT_DOCUMENT_TYPE } },
		parent: null,
		children,
	};

	children.forEach( ( child ) => {
		child.parent = component;
	} );

	return component;
}
