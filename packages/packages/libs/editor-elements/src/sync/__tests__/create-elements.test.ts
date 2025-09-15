import { createMockChild, mockHistoryManager } from 'test-utils';

import { createElement } from '../create-element';
import { createElements } from '../create-elements';
import { deleteElement } from '../delete-element';
import { getContainer } from '../get-container';

jest.mock( '../create-element' );
jest.mock( '../delete-element' );
jest.mock( '../get-container' );

describe( 'createElements', () => {
	const historyMock = mockHistoryManager();
	const mockCreateElement = jest.mocked( createElement );
	const mockDeleteElement = jest.mocked( deleteElement );
	const mockGetContainer = jest.mocked( getContainer );

	beforeEach( () => {
		historyMock.beforeEach();
		mockCreateElement.mockClear();
		mockDeleteElement.mockClear();
		mockGetContainer.mockClear();
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	it( 'should create multiple elements and return their data', () => {
		// Arrange.
		const mockElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		// Add model.toJSON() method to mock elements using spies
		const mockElement1ToJSON = jest.spyOn( mockElement1.model || { toJSON: jest.fn() }, 'toJSON' );
		mockElement1ToJSON.mockReturnValue( { id: 'element-1', elType: 'widget', widgetType: 'button' } );

		const mockElement2ToJSON = jest.spyOn( mockElement2.model || { toJSON: jest.fn() }, 'toJSON' );
		mockElement2ToJSON.mockReturnValue( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockCreateElement.mockReturnValueOnce( mockElement1 ).mockReturnValueOnce( mockElement2 );

		const elementsToCreate = [
			{
				containerId: 'parent-1',
				model: {
					elType: 'widget',
					widgetType: 'button',
					settings: { text: 'Click me' },
				},
			},
			{
				containerId: 'parent-1',
				model: {
					elType: 'widget',
					widgetType: 'text',
					settings: { content: 'Hello world' },
				},
				options: { useHistory: true },
			},
		];

		// Act.
		const createResult = createElements( {
			elements: elementsToCreate,
			title: 'Add Elements',
			subtitle: 'Elements added',
		} );

		// Assert.
		expect( createResult.createdElements ).toHaveLength( 2 );
		expect( createResult.createdElements[ 0 ].elementId ).toBe( 'element-1' );
		expect( createResult.createdElements[ 1 ].elementId ).toBe( 'element-2' );
		expect( mockCreateElement ).toHaveBeenCalledTimes( 2 );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 1, {
			containerId: 'parent-1',
			model: {
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Click me' },
			},
			options: { useHistory: false },
		} );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 2, {
			containerId: 'parent-1',
			model: {
				elType: 'widget',
				widgetType: 'text',
				settings: { content: 'Hello world' },
			},
			options: { useHistory: false }, // useHistory should always be false for nested elements.
		} );

		const historyItem = historyMock.instance.get();
		expect( historyItem?.title ).toBe( 'Add Elements' );
		expect( historyItem?.subTitle ).toBe( 'Elements added' );
	} );

	it( 'should delete created elements on undo and recreate them on redo', () => {
		// Arrange.
		const mockElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockCreateElement
			.mockReturnValueOnce( mockElement1 ) // Initial creation - element 1
			.mockReturnValueOnce( mockElement2 ) // Initial creation - element 2
			.mockReturnValueOnce( mockElement1 ) // Redo - element 1
			.mockReturnValueOnce( mockElement2 ); // Redo - element 2

		const elementsToCreate = [
			{
				containerId: 'parent-1',
				model: {
					elType: 'widget',
					widgetType: 'button',
					settings: { text: 'Click me' },
				},
			},
			{
				containerId: 'parent-1',
				model: {
					elType: 'widget',
					widgetType: 'text',
					settings: { content: 'Hello world' },
				},
			},
		];

		// Act.
		createElements( {
			elements: elementsToCreate,
			title: 'Add Elements',
		} );

		// Act.
		historyMock.instance.undo();

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 2 );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 1, {
			elementId: 'element-2',
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 2, {
			elementId: 'element-1',
			options: { useHistory: false },
		} );

		// Act.
		historyMock.instance.redo();

		// Assert.
		expect( mockCreateElement ).toHaveBeenCalledTimes( 4 );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 3, {
			containerId: 'parent-1',
			model: { id: 'element-1', elType: 'widget', widgetType: 'button' },
			options: { useHistory: false },
		} );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 4, {
			containerId: 'parent-1',
			model: { id: 'element-2', elType: 'widget', widgetType: 'text' },
			options: { useHistory: false },
		} );
	} );

	it( 'should use default subtitle when not provided', () => {
		// Arrange.
		const mockElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockCreateElement.mockReturnValue( mockElement );

		// Act.
		createElements( {
			elements: [
				{
					containerId: 'parent-1',
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {},
					},
				},
			],
			title: 'Add Element',
		} );

		// Assert.
		const historyItem = historyMock.instance.get();
		expect( historyItem?.subTitle ).toBe( 'Item added' );
	} );
} );
