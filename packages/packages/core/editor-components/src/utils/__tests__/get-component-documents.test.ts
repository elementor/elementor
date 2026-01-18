import { createMockDocumentData, createMockElementData } from 'test-utils';
import { type V1ElementData } from '@elementor/editor-elements';

import { getComponentDocumentData } from '../component-document-data';
import { getComponentDocuments } from '../get-component-documents';

jest.mock( '../component-document-data' );

describe( 'getComponentDocuments', () => {
	const mockGetComponentDocumentData = getComponentDocumentData as jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return empty map for empty elements array', async () => {
		// Arrange
		const elements: V1ElementData[] = [];

		// Act
		const result = await getComponentDocuments( elements );

		// Assert
		expect( result.size ).toBe( 0 );
	} );

	it( 'should return empty map for non-component elements', async () => {
		// Arrange
		const elements = [
			createMockElementData( {
				widgetType: 'heading',
				elType: 'widget',
			} ),
			createMockElementData( {
				widgetType: 'button',
				elType: 'widget',
			} ),
		];

		// Act
		const result = await getComponentDocuments( elements );

		// Assert
		expect( result.size ).toBe( 0 );
	} );

	it( 'should return document for single component element', async () => {
		// Arrange
		const componentId = 123;
		const mockDocument = createMockDocumentData( { id: componentId } );
		mockGetComponentDocumentData.mockResolvedValueOnce( mockDocument );

		const elements = [
			createMockElementData( {
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: componentId },
						},
					},
				},
			} ),
		];

		// Act
		const result = await getComponentDocuments( elements );

		// Assert
		expect( result.size ).toBe( 1 );
		expect( result.has( componentId ) ).toBe( true );
		expect( result.get( componentId ) ).toEqual( mockDocument );
	} );

	it( 'should return document when elType is e-component', async () => {
		// Arrange
		const componentId = 456;
		const mockDocument = createMockDocumentData( { id: componentId } );
		mockGetComponentDocumentData.mockResolvedValueOnce( mockDocument );

		const element = createMockElementData( {
			widgetType: 'widget',
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: { $$type: 'number', value: componentId },
					},
				},
			},
		} );
		element.elType = 'e-component';
		const elements = [ element ];

		// Act
		const result = await getComponentDocuments( elements );

		// Assert
		expect( result.size ).toBe( 1 );
		expect( result.has( componentId ) ).toBe( true );
	} );

	it( 'should return multiple documents for multiple component elements', async () => {
		// Arrange
		const componentId1 = 100;
		const componentId2 = 200;
		const mockDocument1 = createMockDocumentData( { id: componentId1 } );
		const mockDocument2 = createMockDocumentData( { id: componentId2 } );

		mockGetComponentDocumentData.mockResolvedValueOnce( mockDocument1 ).mockResolvedValueOnce( mockDocument2 );

		const elements = [
			createMockElementData( {
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: componentId1 },
						},
					},
				},
			} ),
			createMockElementData( {
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: componentId2 },
						},
					},
				},
			} ),
		];

		// Act
		const result = await getComponentDocuments( elements );

		// Assert
		expect( result.size ).toBe( 2 );
		expect( [ ...result.keys() ] ).toEqual( [ componentId1, componentId2 ] );
	} );

	it( 'should deduplicate when same component appears multiple times', async () => {
		// Arrange
		const componentId = 300;
		const mockDocument = createMockDocumentData( { id: componentId } );
		mockGetComponentDocumentData.mockResolvedValue( mockDocument );

		const elements = [
			createMockElementData( {
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: componentId },
						},
					},
				},
			} ),
			createMockElementData( {
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: componentId },
						},
					},
				},
			} ),
		];

		// Act
		const result = await getComponentDocuments( elements );

		// Assert
		expect( result.size ).toBe( 1 );
		expect( mockGetComponentDocumentData ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should recursively process nested components', async () => {
		// Arrange
		const parentComponentId = 400;
		const childComponentId = 500;

		const childElement = createMockElementData( {
			widgetType: 'e-component',
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: { $$type: 'number', value: childComponentId },
					},
				},
			},
		} );

		const parentDocument = {
			...createMockDocumentData( { id: parentComponentId } ),
			elements: [ childElement ],
		};

		const childDocument = createMockDocumentData( { id: childComponentId } );

		mockGetComponentDocumentData.mockResolvedValueOnce( parentDocument ).mockResolvedValueOnce( childDocument );

		const parentElement = createMockElementData( {
			widgetType: 'e-component',
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: { $$type: 'number', value: parentComponentId },
					},
				},
			},
		} );

		// Act
		const result = await getComponentDocuments( [ parentElement ] );

		// Assert
		expect( result.size ).toBe( 2 );
		expect( [ ...result.keys() ] ).toEqual( [ parentComponentId, childComponentId ] );
	} );

	it( 'should recursively process nested child elements', async () => {
		// Arrange
		const componentId1 = 600;
		const componentId2 = 700;
		const componentId3 = 800;

		const nestedChild = createMockElementData( {
			widgetType: 'e-component',
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: { $$type: 'number', value: componentId3 },
					},
				},
			},
		} );

		const child = createMockElementData( {
			widgetType: 'e-component',
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: { $$type: 'number', value: componentId2 },
					},
				},
			},
		} );

		const parent = createMockElementData( {
			widgetType: 'e-component',
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: { $$type: 'number', value: componentId1 },
					},
				},
			},
		} );

		const document1 = {
			...createMockDocumentData( { id: componentId1 } ),
			elements: [ child ],
		};

		const document2 = {
			...createMockDocumentData( { id: componentId2 } ),
			elements: [ nestedChild ],
		};

		const document3 = {
			...createMockDocumentData( { id: componentId3 } ),
			elements: [],
		};

		mockGetComponentDocumentData
			.mockResolvedValueOnce( document1 )
			.mockResolvedValueOnce( document2 )
			.mockResolvedValueOnce( document3 );

		// Act
		const result = await getComponentDocuments( [ parent ] );

		// Assert
		expect( result.size ).toBe( 3 );
		expect( [ ...result.keys() ] ).toEqual( [ componentId1, componentId2, componentId3 ] );
	} );

	it( 'should handle mixed component and non-component elements', async () => {
		// Arrange
		const componentId = 1100;
		const mockDocument = createMockDocumentData( { id: componentId } );
		mockGetComponentDocumentData.mockResolvedValueOnce( mockDocument );

		const elements = [
			createMockElementData( { widgetType: 'heading' } ),
			createMockElementData( {
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: componentId },
						},
					},
				},
			} ),
			createMockElementData( { widgetType: 'button' } ),
		];

		// Act
		const result = await getComponentDocuments( elements );

		// Assert
		expect( result.size ).toBe( 1 );
		expect( result.has( componentId ) ).toBe( true );
	} );
} );
