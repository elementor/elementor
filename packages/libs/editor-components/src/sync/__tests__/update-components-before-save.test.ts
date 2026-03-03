import { createMockDocument } from 'test-utils';
import { invalidateDocumentData } from '@elementor/editor-documents';

import { apiClient } from '../../api';
import { type ComponentDocumentsMap, getComponentDocuments } from '../../utils/get-component-documents';
import { publishDraftComponentsInPageBeforeSave } from '../publish-draft-components-in-page-before-save';

jest.mock( '@elementor/editor-documents', () => ( {
	...jest.requireActual( '@elementor/editor-documents' ),
	invalidateDocumentData: jest.fn(),
} ) );
jest.mock( '../../utils/get-component-documents' );
jest.mock( '../../api' );

describe( 'publishDraftComponentsInPageBeforeSave', () => {
	const PUBLISHED_COMPONENT_ID = 2000;
	const HAS_AUTOSAVE_COMPONENT_ID = 4000;

	const isPublished = ( id: number ) => id === PUBLISHED_COMPONENT_ID;
	const isHasAutosave = ( id: number ) => id === HAS_AUTOSAVE_COMPONENT_ID;

	const createMockDocumentsMap = ( ids: number[] ): ComponentDocumentsMap => {
		return new Map(
			ids.map( ( id ) => [
				id,
				createMockDocument( {
					id,
					status: {
						value: isPublished( id ) || isHasAutosave( id ) ? 'publish' : 'draft',
						label: isPublished( id ) || isHasAutosave( id ) ? 'Published' : 'Draft',
					},
					isDirty: ! isPublished( id ),
					revisions: { current_id: isHasAutosave( id ) ? 9000 : id },
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
		await publishDraftComponentsInPageBeforeSave( {
			elements,
			status: 'publish',
		} );

		// Assert
		expect( apiClient.updateStatuses ).toHaveBeenCalledWith( [ 1000, 3000, 4000 ], 'publish' );
		expect( invalidateDocumentData ).toHaveBeenCalledTimes( 3 );
		expect( invalidateDocumentData ).toHaveBeenNthCalledWith( 1, 1000 );
		expect( invalidateDocumentData ).toHaveBeenNthCalledWith( 2, 3000 );
		expect( invalidateDocumentData ).toHaveBeenNthCalledWith( 3, 4000 );
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
		await publishDraftComponentsInPageBeforeSave( {
			elements,
			status: 'draft',
		} );

		// Assert
		expect( apiClient.updateStatuses ).not.toHaveBeenCalled();
		expect( invalidateDocumentData ).not.toHaveBeenCalled();
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
		await publishDraftComponentsInPageBeforeSave( {
			elements,
			status: 'publish',
		} );

		// Assert
		expect( apiClient.updateStatuses ).not.toHaveBeenCalled();
		expect( invalidateDocumentData ).not.toHaveBeenCalled();
	} );
} );
