import { type Document } from '@elementor/editor-documents';

import { apiClient } from '../../api';
import { getComponentDocumentData, invalidateComponentDocumentData } from '../../utils/component-document-data';
import { getComponentIds } from '../../utils/get-component-ids';
import { updateComponentsBeforeSave } from '../update-components-before-save';

jest.mock( '../../utils/component-document-data' );
jest.mock( '../../utils/get-component-ids' );
jest.mock( '../../api' );

describe( 'updateComponentsBeforeSave', () => {
	const PUBLISHED_COMPONENT_ID = 2000;
	const HAS_AUTOSAVE_COMPONENT_ID = 4000;

	beforeEach( () => {
		jest.mocked( getComponentDocumentData ).mockImplementation( async ( id: number ) => {
			return Promise.resolve( {
				id,
				status: {
					value: id === PUBLISHED_COMPONENT_ID || id === HAS_AUTOSAVE_COMPONENT_ID ? 'publish' : 'draft',
				},
				revisions: { current_id: HAS_AUTOSAVE_COMPONENT_ID === id ? 9000 : id },
			} as Document );
		} );
	} );

	it( 'should update all the components when publishing', async () => {
		// Arrange.
		jest.mocked( getComponentIds ).mockResolvedValue( [
			1000,
			PUBLISHED_COMPONENT_ID,
			3000,
			HAS_AUTOSAVE_COMPONENT_ID,
		] );

		const elements = [
			{
				elType: 'container',
				id: '1',
				elements: [
					{
						elType: 'container',
						id: '2',
						elements: [
							{
								elType: 'widget',
								id: '3',
								widgetType: 'e-component',
								settings: {
									component_instance: {
										$$type: 'component-instance',
										value: {
											component_id: { $$type: 'number', value: 1000 },
										},
									},
								},
							},
						],
					},
					{
						elType: 'widget',
						id: '4',
						widgetType: 'e-component',
						settings: {
							component_instance: {
								$$type: 'component-instance',
								value: {
									component_id: { $$type: 'number', value: PUBLISHED_COMPONENT_ID },
								},
							},
						},
					},
					{
						elType: 'widget',
						id: '5',
						widgetType: 'e-component',
						settings: {
							component_instance: {
								$$type: 'component-instance',
								value: {
									component_id: { $$type: 'number', value: 3000 },
								},
							},
						},
					},
					{
						elType: 'widget',
						id: '6',
						widgetType: 'e-component',
						settings: {
							component_instance: {
								$$type: 'component-instance',
								value: {
									component_id: { $$type: 'number', value: HAS_AUTOSAVE_COMPONENT_ID },
								},
							},
						},
					},
				],
			},
		];

		// Act
		await updateComponentsBeforeSave( {
			elements,
			status: 'publish',
		} );

		// Assert
		expect( apiClient.updateStatuses ).toHaveBeenCalledWith( [ 1000, 3000, 4000 ], 'publish' );
		expect( invalidateComponentDocumentData ).toHaveBeenCalledTimes( 3 );
		expect( invalidateComponentDocumentData ).toHaveBeenNthCalledWith( 1, 1000 );
		expect( invalidateComponentDocumentData ).toHaveBeenNthCalledWith( 2, 3000 );
		expect( invalidateComponentDocumentData ).toHaveBeenNthCalledWith( 3, 4000 );
	} );

	it( 'should not update any components when not publishing', async () => {
		// Arrange.
		jest.mocked( getComponentIds ).mockResolvedValue( [ 1000 ] );

		const elements = [
			{
				elType: 'widget',
				id: '2',
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: 1000 },
						},
					},
				},
			},
		];

		// Act
		await updateComponentsBeforeSave( {
			elements,
			status: 'draft',
		} );

		// Assert
		expect( apiClient.updateStatuses ).not.toHaveBeenCalled();
		expect( invalidateComponentDocumentData ).not.toHaveBeenCalled();
	} );

	it( 'should not update any components when all components are published', async () => {
		// Arrange.
		jest.mocked( getComponentIds ).mockResolvedValue( [ PUBLISHED_COMPONENT_ID ] );

		const elements = [
			{
				elType: 'widget',
				id: '2',
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: PUBLISHED_COMPONENT_ID },
						},
					},
				},
			},
		];

		// Act
		await updateComponentsBeforeSave( {
			elements,
			status: 'publish',
		} );

		// Assert
		expect( apiClient.updateStatuses ).not.toHaveBeenCalled();
		expect( invalidateComponentDocumentData ).not.toHaveBeenCalled();
	} );
} );
