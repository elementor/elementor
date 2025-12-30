import { getCurrentDocumentId, type V1Element } from '@elementor/editor-elements';

import { isTargetInNonEditableComponent } from '../commands/prevent-non-editable-component';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getCurrentDocumentId: jest.fn(),
} ) );

const mockGetCurrentDocumentId = getCurrentDocumentId as jest.Mock;

const MOCK_CURRENT_DOCUMENT_ID = 500;
const MOCK_COMPONENT_DOCUMENT_ID = 600;

describe( 'isTargetInNonEditableComponent', () => {
	beforeEach( () => {
		mockGetCurrentDocumentId.mockReturnValue( MOCK_CURRENT_DOCUMENT_ID );
	} );

	it( 'should return false when targetContainer is undefined', () => {
		// Act
		const result = isTargetInNonEditableComponent( undefined );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false when target has no component ancestor', () => {
		// Arrange
		const container = createMockContainer( { widgetType: 'container' } );

		// Act
		const result = isTargetInNonEditableComponent( container );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false when target is inside a component that is the current document', () => {
		// Arrange
		const componentContainer = createMockContainer( {
			widgetType: 'e-component',
			componentId: MOCK_CURRENT_DOCUMENT_ID,
		} );
		const targetContainer = createMockContainer( {
			widgetType: 'container',
			parent: componentContainer,
		} );

		// Act
		const result = isTargetInNonEditableComponent( targetContainer );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return true when target is inside a component that is not the current document', () => {
		// Arrange
		const componentContainer = createMockContainer( {
			widgetType: 'e-component',
			componentId: MOCK_COMPONENT_DOCUMENT_ID,
		} );
		const targetContainer = createMockContainer( {
			widgetType: 'container',
			parent: componentContainer,
		} );

		// Act
		const result = isTargetInNonEditableComponent( targetContainer );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should check ancestors recursively to find component', () => {
		// Arrange
		const componentContainer = createMockContainer( {
			widgetType: 'e-component',
			componentId: MOCK_COMPONENT_DOCUMENT_ID,
		} );
		const intermediateContainer = createMockContainer( {
			widgetType: 'container',
			parent: componentContainer,
		} );
		const targetContainer = createMockContainer( {
			widgetType: 'container',
			parent: intermediateContainer,
		} );

		// Act
		const result = isTargetInNonEditableComponent( targetContainer );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return false when component ancestor has no component_instance settings', () => {
		// Arrange
		const componentContainer = createMockContainer( {
			widgetType: 'e-component',
		} );
		const targetContainer = createMockContainer( {
			widgetType: 'container',
			parent: componentContainer,
		} );

		// Act
		const result = isTargetInNonEditableComponent( targetContainer );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return true when target itself is a non-editable component', () => {
		// Arrange
		const componentContainer = createMockContainer( {
			widgetType: 'e-component',
			componentId: MOCK_COMPONENT_DOCUMENT_ID,
		} );

		// Act
		const result = isTargetInNonEditableComponent( componentContainer );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return false when target itself is a component being edited', () => {
		// Arrange
		const componentContainer = createMockContainer( {
			widgetType: 'e-component',
			componentId: MOCK_CURRENT_DOCUMENT_ID,
		} );

		// Act
		const result = isTargetInNonEditableComponent( componentContainer );

		// Assert
		expect( result ).toBe( false );
	} );
} );

function createMockContainer( options: { widgetType?: string; componentId?: number; parent?: V1Element } ): V1Element {
	return {
		id: 'mock-container-id',
		parent: options.parent,
		model: {
			toJSON: jest.fn().mockReturnValue( { widgetType: options.widgetType } ),
		},
		settings: {
			get: () => ( {
				$$type: 'component-instance',
				value: {
					component_id: {
						$$type: 'number',
						value: options.componentId,
					},
				},
			} ),
		},
	} as unknown as V1Element;
}
