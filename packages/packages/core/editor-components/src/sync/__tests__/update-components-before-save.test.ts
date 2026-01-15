import { createMockDocument } from 'test-utils';

import { apiClient } from '../../api';
import { invalidateComponentDocumentData } from '../../utils/component-document-data';
import { type ComponentDocumentMap, getComponentDocuments } from '../../utils/get-component-documents';
import { updateComponentsBeforeSave } from '../update-components-before-save';

jest.mock( '../../utils/component-document-data' );
jest.mock( '../../utils/get-component-documents' );
jest.mock( '../../api' );

describe( 'updateComponentsBeforeSave', () => {
	const PUBLISHED_COMPONENT_ID = 2000;
	const HAS_AUTOSAVE_COMPONENT_ID = 4000;

	const createMockDocumentsMap = ( ids: number[] ): ComponentDocumentMap => {
		return new Map(
			ids.map( ( id ) => [
				id,
				createMockDocument( {
					id,
					status: {
						value: id === PUBLISHED_COMPONENT_ID || id === HAS_AUTOSAVE_COMPONENT_ID ? 'publish' : 'draft',
						label:
							id === PUBLISHED_COMPONENT_ID || id === HAS_AUTOSAVE_COMPONENT_ID ? 'Published' : 'Draft',
					},
					isDirty: id !== PUBLISHED_COMPONENT_ID,
					revisions: { current_id: HAS_AUTOSAVE_COMPONENT_ID === id ? 9000 : id },
				} ),
			] )
		);
	};

	it( 'should update all the components when publishing', async () => {
		// Arrange
		const componentIds = [ 1000, PUBLISHED_COMPONENT_ID, 3000, HAS_AUTOSAVE_COMPONENT_ID ];
		jest.mocked( getComponentDocuments ).mockResolvedValue( createMockDocumentsMap( componentIds ) );

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
		// Arrange
		jest.mocked( getComponentDocuments ).mockResolvedValue( createMockDocumentsMap( [ 1000 ] ) );

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
		// Arrange
		jest.mocked( getComponentDocuments ).mockResolvedValue( createMockDocumentsMap( [ PUBLISHED_COMPONENT_ID ] ) );

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
