import { createHooksRegistry, createMockElement, setupHooksRegistry } from 'test-utils';
import { type V1Document } from '@elementor/editor-documents';
import { createElement, selectElement, type V1Element } from '@elementor/editor-elements';

import { COMPONENT_DOCUMENT_TYPE } from '../../components/consts';
import { isEditingComponent } from '../../utils/is-editing-component';
import { type DeleteArgs, initHandleComponentEditModeContainer } from '../handle-component-edit-mode-container';

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
		const deleteContainers = ( args: DeleteArgs ) => {
			const containersToDelete = args.containers ?? ( args.container ? [ args.container ] : [] );
			for ( const container of containersToDelete ) {
				if ( container.parent ) {
					container.parent.children = container.parent.children?.filter(
						( child ) => child.id !== container.id
					);
				}
			}

			const deleteHook = hooksRegistry.getByCommand( 'document/elements/delete' );
			deleteHook?.apply( args );
		};

		it( 'should register a hook for document/elements/delete command', () => {
			// Act
			initHandleComponentEditModeContainer();

			const deleteHook = hooksRegistry.getByCommand( 'document/elements/delete' );

			// Assert
			expect( deleteHook ).toBeDefined();
		} );

		it( 'should create new top level container when top level element is deleted from component', () => {
			// Arrange
			jest.mocked( createElement ).mockReturnValue( { id: 'new-container-id' } as unknown as V1Element );

			initHandleComponentEditModeContainer();

			const deletedElement = createMockElement( { model: { id: 'deleted-element' } } );
			createMockComponentContainer( [ deletedElement ] );

			// Act
			deleteContainers( { container: deletedElement } );

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

			const deletedElement = createMockElement( { model: { id: 'deleted-element' } } );
			const remainingElement = createMockElement( { model: { id: 'remaining-element' } } );
			createMockComponentContainer( [ deletedElement, remainingElement ] );

			// Act
			deleteContainers( { container: deletedElement } );

			// Assert
			expect( createElement ).not.toHaveBeenCalled();
		} );

		it( 'should not create new top level container when not in component edit mode', () => {
			// Arrange
			jest.mocked( isEditingComponent ).mockReturnValue( false );
			initHandleComponentEditModeContainer();

			const deletedElement = createMockElement( { model: { id: 'deleted-element' } } );
			createMockComponentContainer( [ deletedElement ] );

			// Act
			deleteContainers( { container: deletedElement } );

			// Assert
			expect( createElement ).not.toHaveBeenCalled();
		} );

		it( 'should not create new top level container when parent is not a component', () => {
			// Arrange
			initHandleComponentEditModeContainer();

			const parent = createMockElement( { model: { id: 'regular-container' } } );
			const deletedElement = createMockElement( { model: { id: 'deleted-element' }, parent } );

			// Act
			deleteContainers( { container: deletedElement } );

			// Assert
			expect( createElement ).not.toHaveBeenCalled();
		} );

		it( 'should handle containers array', () => {
			// Arrange
			initHandleComponentEditModeContainer();

			const deletedElement1 = createMockElement( { model: { id: 'deleted-1' } } );
			const deletedElement2 = createMockElement( { model: { id: 'deleted-2' } } );
			createMockComponentContainer( [ deletedElement1 ] );

			// Act
			deleteContainers( { containers: [ deletedElement1, deletedElement2 ] } );

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

			const topLevelElement = createMockElement( { model: { id: 'top-level-element' } } );
			const component = createMockComponentContainer( [ topLevelElement ] );
			const args = { container: component };

			// Act
			const result = hook?.apply( args );

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
			const result = hook?.apply( args );

			// Assert
			expect( result ).toBe( true );
			expect( args.container ).toBe( component );
		} );

		it( 'should not redirect when not editing a component', () => {
			// Arrange
			jest.mocked( isEditingComponent ).mockReturnValue( false );
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'preview/drop' );

			const topLevelElement = createMockElement( { model: { id: 'top-level-element' } } );
			const component = createMockComponentContainer( [ topLevelElement ] );
			const args = { container: component };

			// Act
			const result = hook?.apply( args );

			// Assert
			expect( result ).toBe( true );
			expect( args.container ).toBe( component );
		} );

		it( 'should not redirect when container is not a component', () => {
			// Arrange
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'preview/drop' );

			const regularContainer = createMockElement( { model: { id: 'regular-container' } } );
			const args = { container: regularContainer };

			// Act
			const result = hook?.apply( args );

			// Assert
			expect( result ).toBe( true );
			expect( args.container ).toBe( regularContainer );
		} );

		it.only( 'should handle containers array', () => {
			// Arrange
			initHandleComponentEditModeContainer();
			const hook = hooksRegistry.getByCommand( 'preview/drop' );

			const topLevelElement = createMockElement( { model: { id: 'top-level-element' } } );
			const component1 = createMockComponentContainer( [ topLevelElement ] );

			const otherElement = createMockElement( { model: { id: 'other-element' } } );

			// Act
			const args = { containers: [ component1, otherElement ] };
			const result = hook?.apply( args );

			// Assert
			expect( result ).toBe( true );
			expect( args.containers[ 0 ] ).toBe( topLevelElement );
			expect( args.containers[ 1 ] ).toBe( otherElement );
		} );
	} );
} );

type MockContainer = NonNullable< DeleteArgs[ 'container' ] >;

function createMockComponentContainer( children: MockContainer[] = [] ): MockContainer {
	const component = createMockElement( {
		model: { id: 'document' },
		children,
	} ) as MockContainer;

	component.document = { config: { type: COMPONENT_DOCUMENT_TYPE } } as unknown as V1Document;

	children?.forEach( ( child: MockContainer ) => {
		child.parent = component;
	} );

	return component;
}
