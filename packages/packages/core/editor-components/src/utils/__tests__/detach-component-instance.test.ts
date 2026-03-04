import { createMockContainer, createMockElementData, mockHistoryManager } from 'test-utils';
import { type Document } from '@elementor/editor-documents';
import { getContainer, replaceElement, type V1Element } from '@elementor/editor-elements';

import { getComponentDocumentData } from '../component-document-data';
import { detachComponentInstance } from '../detach-component-instance';
import { resolveDetachedInstance } from '../resolve-detached-instance';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn( () => null ),
	__dispatch: jest.fn(),
} ) );
jest.mock( '../component-document-data' );
jest.mock( '../resolve-detached-instance' );
jest.mock( '../tracking' );

const mockGetContainer = getContainer as jest.MockedFunction< typeof getContainer >;
const mockReplaceElement = replaceElement as jest.MockedFunction< typeof replaceElement >;
const mockResolveDetachedInstance = resolveDetachedInstance as jest.MockedFunction< typeof resolveDetachedInstance >;
const mockGetComponentDocumentData = getComponentDocumentData as jest.MockedFunction< typeof getComponentDocumentData >;

describe( 'detachComponentInstance', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		historyMock.beforeEach();

		mockGetComponentDocumentData.mockResolvedValue( {
			elements: [
				createMockElementData( {
					id: 'component-root-element',
					elType: 'e-flexbox',
					settings: {},
				} ),
			],
		} as unknown as Document );
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	it( 'should replace instance with detached instance element', async () => {
		// Arrange.
		const mockContainer = createMockContainer( 'instance-123' );
		const mockResolvedInstance = createMockElementData( {
			id: 'detached-element-id',
			elType: 'e-flexbox',
			settings: {},
		} );

		mockGetContainer.mockReturnValue( mockContainer as V1Element );
		mockResolveDetachedInstance.mockReturnValue( mockResolvedInstance );

		// Act.
		await detachComponentInstance( {
			instanceId: 'instance-123',
			componentId: 456,
		} );

		// Assert.
		expect( mockResolveDetachedInstance ).toHaveBeenCalled();

		expect( mockReplaceElement ).toHaveBeenCalledWith(
			expect.objectContaining( {
				currentElementId: 'instance-123',
				newElement: mockResolvedInstance,
				withHistory: false,
			} )
		);
	} );

	it( 'should restore instance on undo and re-detach on redo', async () => {
		// Arrange.
		const originalInstanceModel = {
			id: 'instance-123',
			elType: 'widget',
			widgetType: 'e-component',
			settings: {},
		};

		const mockContainer = {
			...createMockContainer( 'instance-123' ),
			model: {
				toJSON: () => originalInstanceModel,
			},
		};

		const mockResolvedInstance = createMockElementData( {
			id: 'detached-element-id',
			elType: 'e-flexbox',
			settings: {},
		} );

		const mockDetachedElement = createMockContainer( 'detached-element-id' );
		const mockRestoredInstance = createMockContainer( 'restored-instance-id' );

		mockGetContainer.mockReturnValue( mockContainer as V1Element );
		mockResolveDetachedInstance.mockReturnValue( mockResolvedInstance );
		mockReplaceElement
			.mockReturnValueOnce( mockDetachedElement as V1Element )
			.mockReturnValueOnce( mockRestoredInstance as V1Element )
			.mockReturnValueOnce( mockDetachedElement as V1Element );

		// Act - initial detach.
		await detachComponentInstance( {
			instanceId: 'instance-123',
			componentId: 456,
		} );

		// Assert - initial detach.
		expect( mockReplaceElement ).toHaveBeenCalledTimes( 1 );
		expect( mockReplaceElement ).toHaveBeenCalledWith( {
			currentElementId: 'instance-123',
			newElement: mockResolvedInstance,
			withHistory: false,
		} );

		// Act - undo.
		historyMock.instance.undo();

		// Assert - undo restores the original instance.
		expect( mockReplaceElement ).toHaveBeenCalledTimes( 2 );
		expect( mockReplaceElement ).toHaveBeenNthCalledWith( 2, {
			currentElementId: 'detached-element-id',
			newElement: originalInstanceModel,
			withHistory: false,
		} );

		// Act - redo.
		historyMock.instance.redo();

		// Assert - redo re-detaches using the restored instance id.
		expect( mockReplaceElement ).toHaveBeenCalledTimes( 3 );
		expect( mockReplaceElement ).toHaveBeenNthCalledWith( 3, {
			currentElementId: 'restored-instance-id',
			newElement: mockResolvedInstance,
			withHistory: false,
		} );
	} );

	it( 'should set history title and subtitle', async () => {
		// Arrange.
		const mockContainer = createMockContainer( 'instance-123' );
		const mockResolvedInstance = createMockElementData( {
			id: 'detached-element-id',
			elType: 'e-flexbox',
			settings: {},
		} );
		const mockDetachedElement = createMockContainer( 'detached-element-id' );

		mockGetContainer.mockReturnValue( mockContainer as V1Element );
		mockResolveDetachedInstance.mockReturnValue( mockResolvedInstance );
		mockReplaceElement.mockReturnValue( mockDetachedElement as V1Element );

		// Act.
		await detachComponentInstance( {
			instanceId: 'instance-123',
			componentId: 456,
		} );

		// Assert.
		const historyItem = historyMock.instance.get();
		expect( historyItem?.title ).toBe( 'Detach from Component' );
		expect( historyItem?.subTitle ).toBe( 'Instance detached' );
	} );
} );
