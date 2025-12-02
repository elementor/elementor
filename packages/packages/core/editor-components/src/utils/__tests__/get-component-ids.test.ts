import { createMockDocumentData, createMockElementData } from 'test-utils';
import { type V1ElementData } from '@elementor/editor-elements';

import { getComponentDocumentData } from '../component-document-data';
import { getComponentIds } from '../get-component-ids';

jest.mock( '../component-document-data' );

describe( 'getComponentIds', () => {
	const mockGetComponentDocumentData = getComponentDocumentData as jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return empty array for empty elements array', async () => {
		// Arrange
		const elements: V1ElementData[] = [];

		// Act
		const result = await getComponentIds( elements );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should return empty array for non-component elements', async () => {
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
		const result = await getComponentIds( elements );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should return component ID for single component element', async () => {
		// Arrange
		const componentId = 123;
		const elements = [
			createMockElementData( {
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: componentId,
						},
					},
				},
			} ),
		];

		// Act
		const result = await getComponentIds( elements );

		// Assert
		expect( result ).toEqual( [ componentId ] );
	} );

	it( 'should return component ID when elType is e-component', async () => {
		// Arrange
		const componentId = 456;
		const element = createMockElementData( {
			widgetType: 'widget',
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: componentId,
					},
				},
			},
		} );
		element.elType = 'e-component';
		const elements = [ element ];

		// Act
		const result = await getComponentIds( elements );

		// Assert
		expect( result ).toEqual( [ componentId ] );
	} );

	it( 'should return multiple component IDs for multiple component elements', async () => {
		// Arrange
		const componentId1 = 100;
		const componentId2 = 200;
		const elements = [
			createMockElementData( {
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: componentId1,
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
							component_id: componentId2,
						},
					},
				},
			} ),
		];

		// Act
		const result = await getComponentIds( elements );

		// Assert
		expect( result ).toEqual( [ componentId1, componentId2 ] );
	} );

	it( 'should return unique component IDs when duplicates exist', async () => {
		// Arrange
		const componentId = 300;
		const elements = [
			createMockElementData( {
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: componentId,
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
							component_id: componentId,
						},
					},
				},
			} ),
		];

		// Act
		const result = await getComponentIds( elements );

		// Assert
		expect( result ).toEqual( [ componentId ] );
	} );

	it( 'should recursively process child elements from component document', async () => {
		// Arrange
		const parentComponentId = 400;
		const childComponentId = 500;
		const childElement = createMockElementData( {
			widgetType: 'e-component',
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: childComponentId,
					},
				},
			},
		} );

		const parentElement = createMockElementData( {
			widgetType: 'e-component',
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: parentComponentId,
					},
				},
			},
		} );

		const componentDocument = {
			...createMockDocumentData( {
				id: parentComponentId,
			} ),
			elements: [ childElement ],
		};

		mockGetComponentDocumentData.mockResolvedValueOnce( componentDocument );

		// Act
		const result = await getComponentIds( [ parentElement ] );

		// Assert
		expect( result ).toEqual( [ parentComponentId, childComponentId ] );
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
						component_id: componentId3,
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
						component_id: componentId2,
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
						component_id: componentId1,
					},
				},
			},
		} );

		const document1 = {
			...createMockDocumentData( {
				id: componentId1,
			} ),
			elements: [ child ],
		};

		const document2 = {
			...createMockDocumentData( {
				id: componentId2,
			} ),
			elements: [ nestedChild ],
		};

		const document3 = {
			...createMockDocumentData( {
				id: componentId3,
			} ),
			elements: [],
		};

		mockGetComponentDocumentData
			.mockResolvedValueOnce( document1 )
			.mockResolvedValueOnce( document2 )
			.mockResolvedValueOnce( document3 );

		// Act
		const result = await getComponentIds( [ parent ] );

		// Assert
		expect( result ).toEqual( [ componentId1, componentId2, componentId3 ] );
	} );

	it( 'should process child elements from original element structure', async () => {
		// Arrange
		const componentId = 900;
		const childElement = createMockElementData( {
			widgetType: 'heading',
		} );

		const componentElement = createMockElementData( {
			widgetType: 'e-component',
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: componentId,
					},
				},
			},
			elements: [ childElement ],
		} );

		// Act
		const result = await getComponentIds( [ componentElement ] );

		// Assert
		expect( result ).toEqual( [ componentId ] );
	} );

	it( 'should handle mixed component and non-component elements', async () => {
		// Arrange
		const componentId = 1100;
		const elements = [
			createMockElementData( {
				widgetType: 'heading',
			} ),
			createMockElementData( {
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: componentId,
						},
					},
				},
			} ),
			createMockElementData( {
				widgetType: 'button',
			} ),
		];

		// Act
		const result = await getComponentIds( elements );

		// Assert
		expect( result ).toEqual( [ componentId ] );
	} );
} );
