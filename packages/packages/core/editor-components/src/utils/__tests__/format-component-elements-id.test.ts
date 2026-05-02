import { type V1ElementData } from '@elementor/editor-elements';

import { formatComponentElementsId } from '../format-component-elements-id';

const ELEMENT_IDS = [ '32975a4', '3ddd07a', 'ff531ef', '8f7a2dc', 'b559a00' ];

describe( 'formatComponentElementsId', () => {
	it( 'should format single element with hashed ID and add originId', () => {
		// Arrange
		const elementId = ELEMENT_IDS[ 0 ];
		const instanceId = ELEMENT_IDS[ 1 ];

		const elements: V1ElementData[] = [
			{
				id: elementId,
				elType: 'e-flexbox',
				elements: [],
			},
		];
		const path = [ instanceId ];

		// Act
		const result = formatComponentElementsId( elements, path );

		// Assert
		expect( result ).toEqual( [
			{
				id: '1e00vc4',
				originId: elementId,
				elType: 'e-flexbox',
				elements: [],
			},
		] );
	} );

	it( 'should preserve all element properties except id', () => {
		// Arrange
		const elementId = ELEMENT_IDS[ 0 ];
		const instanceId = ELEMENT_IDS[ 1 ];

		const elements: V1ElementData[] = [
			{
				id: elementId,
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Click me' },
				editor_settings: { title: 'My Button' },
				elements: [],
			},
		];
		const path = [ instanceId ];

		// Act
		const result = formatComponentElementsId( elements, path );

		// Assert
		expect( result ).toEqual( [
			{
				id: '1e00vc4',
				originId: elementId,
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Click me' },
				editor_settings: { title: 'My Button' },
				elements: [],
			},
		] );
	} );

	it( 'should recursively format nested elements', () => {
		// Arrange
		const parentId = ELEMENT_IDS[ 0 ];
		const childId1 = ELEMENT_IDS[ 1 ];
		const childId2 = ELEMENT_IDS[ 2 ];
		const childId3 = ELEMENT_IDS[ 3 ];
		const instanceId = ELEMENT_IDS[ 4 ];

		const elements: V1ElementData[] = [
			{
				id: parentId,
				elType: 'e-div-block',
				elements: [
					{
						id: childId1,
						elType: 'widget',
						elements: [],
					},
					{
						id: childId2,
						elType: 'e-flexbox',
						elements: [
							{
								id: childId3,
								elType: 'widget',
								elements: [],
							},
						],
					},
				],
			},
		];
		const path = [ instanceId ];

		// Act
		const result = formatComponentElementsId( elements, path );

		// Assert
		expect( result ).toEqual( [
			{
				id: '1b1w3wv',
				originId: parentId,
				elType: 'e-div-block',
				elements: [
					{
						id: '1ose7z5',
						originId: childId1,
						elType: 'widget',
						elements: [],
					},
					{
						id: '0dr8u4k',
						originId: childId2,
						elType: 'e-flexbox',
						elements: [
							{
								id: '10muleu',
								originId: childId3,
								elType: 'widget',
								elements: [],
							},
						],
					},
				],
			},
		] );
	} );

	it( 'should create the same id for the same element with the same path', () => {
		// Arrange
		const elementId = ELEMENT_IDS[ 0 ];
		const innerInstanceId = ELEMENT_IDS[ 1 ];
		const outerInstanceId = ELEMENT_IDS[ 2 ];

		const elements: V1ElementData[] = [
			{
				id: elementId,
				elType: 'e-flexbox',
			},
		];
		const path = [ outerInstanceId, innerInstanceId ];

		// Act
		const result1 = formatComponentElementsId( elements, path );
		const result2 = formatComponentElementsId( elements, path );

		// Assert
		expect( result1[ 0 ].id ).toBe( result2[ 0 ].id );
	} );

	it( 'should create unique IDs for same element with different paths', () => {
		// Arrange
		const elementId = ELEMENT_IDS[ 0 ];
		const outerInstanceId = ELEMENT_IDS[ 1 ];
		const innerInstanceId1 = ELEMENT_IDS[ 2 ];
		const innerInstanceId2 = ELEMENT_IDS[ 3 ];

		const elements: V1ElementData[] = [
			{
				id: elementId,
				elType: 'e-flexbox',
				elements: [],
			},
		];

		const path1 = [ outerInstanceId, innerInstanceId1 ];
		const path2 = [ outerInstanceId, innerInstanceId2 ];

		// Act
		const result1 = formatComponentElementsId( elements, path1 );
		const result2 = formatComponentElementsId( elements, path2 );

		// Assert
		expect( result1[ 0 ].id ).not.toBe( result2[ 0 ].id );
	} );
} );
