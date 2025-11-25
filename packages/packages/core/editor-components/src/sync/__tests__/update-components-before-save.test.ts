import { apiClient } from '../../api';
import { getComponentDocumentData, invalidateComponentDocumentData } from '../../utils/component-document-data';
import { updateComponentsBeforeSave } from '../update-components-before-save';
import { createMockContainer } from './utils';

jest.mock( '../../utils/component-document-data' );
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
			} );
		} );
	} );

	it( 'should update all the components when publishing', async () => {
		// Arrange.

		const container = createMockContainer( [
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
										value: { component_id: 1000 },
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
								value: { component_id: PUBLISHED_COMPONENT_ID },
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
								value: { component_id: 3000 },
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
								value: { component_id: HAS_AUTOSAVE_COMPONENT_ID },
							},
						},
					},
				],
			},
		] );

		// Act
		await updateComponentsBeforeSave( {
			container,
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
		const container = createMockContainer( [
			{
				elType: 'widget',
				id: '2',
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: { component_id: 1000 },
					},
				},
			},
		] );

		// Act
		await updateComponentsBeforeSave( {
			container,
			status: 'draft',
		} );

		// Assert
		expect( apiClient.updateStatuses ).not.toHaveBeenCalled();
		expect( invalidateComponentDocumentData ).not.toHaveBeenCalled();
	} );

	it( 'should not update any components when all components are published', async () => {
		// Arrange.
		const container = createMockContainer( [
			{
				elType: 'widget',
				id: '2',
				widgetType: 'e-component',
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: { component_id: PUBLISHED_COMPONENT_ID },
					},
				},
			},
		] );

		// Act
		await updateComponentsBeforeSave( {
			container,
			status: 'publish',
		} );

		// Assert
		expect( apiClient.updateStatuses ).not.toHaveBeenCalled();
		expect( invalidateComponentDocumentData ).not.toHaveBeenCalled();
	} );
} );
