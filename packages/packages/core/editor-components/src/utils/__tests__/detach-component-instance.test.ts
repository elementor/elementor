import { getContainer, replaceElement } from '@elementor/editor-elements';

import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { getComponentDocumentData } from '../component-document-data';
import { detachComponentInstance } from '../detach-component-instance';
import { trackComponentEvent } from '../tracking';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../component-document-data' );
jest.mock( '../tracking' );

const mockGetContainer = getContainer as jest.MockedFunction< typeof getContainer >;
const mockReplaceElement = replaceElement as jest.MockedFunction< typeof replaceElement >;
const mockGetComponentDocumentData = getComponentDocumentData as jest.MockedFunction<
	typeof getComponentDocumentData
>;
const mockTrackComponentEvent = trackComponentEvent as jest.MockedFunction< typeof trackComponentEvent >;

describe( 'detachComponentInstance', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should detach instance and create container', async () => {
		const mockContainer = {
			id: 'instance-123',
			model: {
				toJSON: () => ( {
					id: 'instance-123',
					elType: 'widget',
					widgetType: 'e-component',
					settings: {
						component_instance: componentInstancePropTypeUtil.create( {
							component_id: {
								$$type: 'number',
								value: 456,
							},
							overrides: [],
						} ),
					},
				} ),
			},
		};

		const mockComponentData = {
			elements: [
				{
					id: 'element-1',
					elType: 'widget',
					widgetType: 'heading',
					settings: {
						title: 'Title',
					},
				},
			],
		};

		mockGetContainer.mockReturnValue( mockContainer as any );
		mockGetComponentDocumentData.mockResolvedValue( mockComponentData as any );

		await detachComponentInstance( {
			instanceId: 'instance-123',
			componentId: 456,
		} );

		expect( mockReplaceElement ).toHaveBeenCalledWith( {
			currentElement: mockContainer.model.toJSON(),
			newElement: {
				elType: 'e-flexbox',
				settings: {},
				elements: mockComponentData.elements,
			},
			withHistory: true,
		} );
	} );

	it( 'should apply overrides when detaching', async () => {
		const mockContainer = {
			id: 'instance-123',
			model: {
				toJSON: () => ( {
					id: 'instance-123',
					elType: 'widget',
					widgetType: 'e-component',
					settings: {
						component_instance: componentInstancePropTypeUtil.create( {
							component_id: {
								$$type: 'number',
								value: 456,
							},
							overrides: [
								{
									$$type: 'override',
									value: {
										override_key: 'element-1_title',
										override_value: 'Overridden Title',
										schema_source: {
											type: 'component',
											id: 456,
										},
									},
								},
							],
						} ),
					},
				} ),
			},
		};

		const mockComponentData = {
			elements: [
				{
					id: 'element-1',
					elType: 'widget',
					widgetType: 'heading',
					settings: {
						title: 'Original Title',
					},
				},
			],
		};

		mockGetContainer.mockReturnValue( mockContainer as any );
		mockGetComponentDocumentData.mockResolvedValue( mockComponentData as any );

		await detachComponentInstance( {
			instanceId: 'instance-123',
			componentId: 456,
		} );

		const replaceCall = mockReplaceElement.mock.calls[ 0 ][ 0 ];
		expect( replaceCall.newElement.elements[ 0 ].settings.title ).toBe( 'Overridden Title' );
	} );

	it( 'should track analytics event on successful detach', async () => {
		const mockContainer = {
			id: 'instance-123',
			model: {
				toJSON: () => ( {
					id: 'instance-123',
					elType: 'widget',
					widgetType: 'e-component',
					settings: {
						component_instance: componentInstancePropTypeUtil.create( {
							component_id: {
								$$type: 'number',
								value: 456,
							},
							overrides: [],
						} ),
					},
				} ),
			},
		};

		const mockComponentData = {
			elements: [],
		};

		mockGetContainer.mockReturnValue( mockContainer as any );
		mockGetComponentDocumentData.mockResolvedValue( mockComponentData as any );

		await detachComponentInstance( {
			instanceId: 'instance-123',
			componentId: 456,
		} );

		expect( mockTrackComponentEvent ).toHaveBeenCalledWith( {
			action: 'detached',
			source: 'user',
			component_id: 456,
			instance_id: 'instance-123',
		} );
	} );

	it( 'should throw error if instance container not found', async () => {
		mockGetContainer.mockReturnValue( null );

		await expect(
			detachComponentInstance( {
				instanceId: 'non-existent',
				componentId: 456,
			} )
		).rejects.toThrow( 'Instance container with ID "non-existent" not found.' );
	} );

	it( 'should throw error if component data not found', async () => {
		const mockContainer = {
			id: 'instance-123',
			model: {
				toJSON: () => ( {
					id: 'instance-123',
					elType: 'widget',
					widgetType: 'e-component',
					settings: {},
				} ),
			},
		};

		mockGetContainer.mockReturnValue( mockContainer as any );
		mockGetComponentDocumentData.mockResolvedValue( null );

		await expect(
			detachComponentInstance( {
				instanceId: 'instance-123',
				componentId: 456,
			} )
		).rejects.toThrow( 'Component with ID "456" not found.' );
	} );

	it( 'should create history entry', async () => {
		const mockContainer = {
			id: 'instance-123',
			model: {
				toJSON: () => ( {
					id: 'instance-123',
					elType: 'widget',
					widgetType: 'e-component',
					settings: {
						component_instance: componentInstancePropTypeUtil.create( {
							component_id: {
								$$type: 'number',
								value: 456,
							},
							overrides: [],
						} ),
					},
				} ),
			},
		};

		const mockComponentData = {
			elements: [],
		};

		mockGetContainer.mockReturnValue( mockContainer as any );
		mockGetComponentDocumentData.mockResolvedValue( mockComponentData as any );

		await detachComponentInstance( {
			instanceId: 'instance-123',
			componentId: 456,
		} );

		expect( mockReplaceElement ).toHaveBeenCalledWith(
			expect.objectContaining( {
				withHistory: true,
			} )
		);
	} );
} );
