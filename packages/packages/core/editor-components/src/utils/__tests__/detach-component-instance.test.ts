import { getContainer, replaceElement } from '@elementor/editor-elements';

import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { componentInstanceOverridesPropTypeUtil } from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { getComponentDocumentData } from '../component-document-data';
import { detachComponentInstance } from '../detach-component-instance';
import { trackComponentEvent } from '../tracking';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../component-document-data' );
jest.mock( '../tracking' );

const mockGetContainer = getContainer as jest.MockedFunction< typeof getContainer >;
const mockReplaceElement = replaceElement as jest.MockedFunction< typeof replaceElement >;
const mockGetComponentDocumentData = getComponentDocumentData as jest.MockedFunction< typeof getComponentDocumentData >;
const mockTrackComponentEvent = trackComponentEvent as jest.MockedFunction< typeof trackComponentEvent >;

describe( 'detachComponentInstance', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should detach instance and replace with root element', async () => {
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
							overrides: componentInstanceOverridesPropTypeUtil.create( [] ),
						} ),
					},
				} ),
			},
		};

		const mockComponentData = {
			elements: [
				{
					id: 'root-element',
					elType: 'e-flexbox',
					settings: {},
					elements: [
						{
							id: 'element-1',
							elType: 'widget',
							widgetType: 'heading',
							settings: {
								title: { $$type: 'string', value: 'Title' },
							},
						},
					],
				},
			],
		};

		mockGetContainer.mockReturnValue( mockContainer as any );
		mockGetComponentDocumentData.mockResolvedValue( mockComponentData as any );

		await detachComponentInstance( {
			instanceId: 'instance-123',
			componentId: 456,
		} );

		expect( mockReplaceElement ).toHaveBeenCalledWith(
			expect.objectContaining( {
				currentElementId: 'instance-123',
				withHistory: true,
			} )
		);
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
							overrides: componentInstanceOverridesPropTypeUtil.create( [
								componentInstanceOverridePropTypeUtil.create( {
									override_key: 'title-override-key',
									override_value: { $$type: 'string', value: 'Overridden Title' },
									schema_source: { type: 'component', id: 456 },
								} ),
							] ),
						} ),
					},
				} ),
			},
		};

		const mockComponentData = {
			elements: [
				{
					id: 'root-element',
					elType: 'e-flexbox',
					settings: {
						title: {
							$$type: 'overridable',
							value: {
								override_key: 'title-override-key',
								origin_value: { $$type: 'string', value: 'Original Title' },
							},
						},
					},
					elements: [],
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
		expect( replaceCall.newElement.settings?.title ).toEqual( {
			$$type: 'string',
			value: 'Overridden Title',
		} );
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
							overrides: componentInstanceOverridesPropTypeUtil.create( [] ),
						} ),
					},
				} ),
			},
		};

		const mockComponentData = {
			elements: [
				{
					id: 'root-element',
					elType: 'e-flexbox',
					settings: {},
				},
			],
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

	it( 'should throw error if component has no root element', async () => {
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
							overrides: componentInstanceOverridesPropTypeUtil.create( [] ),
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

		await expect(
			detachComponentInstance( {
				instanceId: 'instance-123',
				componentId: 456,
			} )
		).rejects.toThrow( 'Component with ID "456" has no root element.' );
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
							overrides: componentInstanceOverridesPropTypeUtil.create( [] ),
						} ),
					},
				} ),
			},
		};

		const mockComponentData = {
			elements: [
				{
					id: 'root-element',
					elType: 'e-flexbox',
					settings: {},
				},
			],
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
