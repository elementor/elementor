import { createMockChild, createMockContainer, mockHistoryManager } from 'test-utils';

import { createElement } from '../create-element';
import { createElements } from '../create-elements';
import { deleteElement } from '../delete-element';

jest.mock( '../create-element' );
jest.mock( '../delete-element' );

describe( 'createElements', () => {
	const historyMock = mockHistoryManager();
	const mockCreateElement = jest.mocked( createElement );
	const mockDeleteElement = jest.mocked( deleteElement );

	beforeEach( () => {
		historyMock.beforeEach();
		mockCreateElement.mockClear();
		mockDeleteElement.mockClear();
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	it( 'should create multiple elements and return their data', () => {
		// Arrange.
		const mockParent = createMockContainer( 'parent-1', [] );
		const mockElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockCreateElement.mockReturnValueOnce( mockElement1 ).mockReturnValueOnce( mockElement2 );

		const elementsToCreate = [
			{
				container: mockParent,
				model: {
					elType: 'widget',
					widgetType: 'button',
					settings: { text: 'Click me' },
				},
			},
			{
				container: mockParent,
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
		expect( createResult.createdElements[ 0 ].container.id ).toBe( 'element-1' );
		expect( createResult.createdElements[ 1 ].container.id ).toBe( 'element-2' );
		expect( mockCreateElement ).toHaveBeenCalledTimes( 2 );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 1, {
			container: mockParent,
			model: {
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Click me' },
			},
			options: { useHistory: false },
		} );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 2, {
			container: mockParent,
			model: {
				elType: 'widget',
				widgetType: 'text',
				settings: { content: 'Hello world' },
			},
			options: { useHistory: false },
		} );

		const historyItem = historyMock.instance.get();
		expect( historyItem?.title ).toBe( 'Add Elements' );
		expect( historyItem?.subTitle ).toBe( 'Elements added' );
	} );

	it( 'should delete created elements on undo and recreate them on redo', () => {
		// Arrange.
		const mockParent = createMockContainer( 'parent-1', [] );
		const mockElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockCreateElement
			.mockReturnValueOnce( mockElement1 )
			.mockReturnValueOnce( mockElement2 )
			.mockReturnValueOnce( mockElement1 )
			.mockReturnValueOnce( mockElement2 );

		const elementsToCreate = [
			{
				container: mockParent,
				model: {
					elType: 'widget',
					widgetType: 'button',
					settings: { text: 'Click me' },
				},
			},
			{
				container: mockParent,
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
			container: mockElement2,
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 2, {
			container: mockElement1,
			options: { useHistory: false },
		} );

		// Act.
		historyMock.instance.redo();

		// Assert.
		expect( mockCreateElement ).toHaveBeenCalledTimes( 4 );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 3, {
			container: mockParent,
			model: { id: 'element-1', elType: 'widget', widgetType: 'button' },
			options: { useHistory: false },
		} );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 4, {
			container: mockParent,
			model: { id: 'element-2', elType: 'widget', widgetType: 'text' },
			options: { useHistory: false },
		} );
	} );

	it( 'should use default subtitle when not provided', () => {
		// Arrange.
		const mockParent = createMockContainer( 'parent-1', [] );
		const mockElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockCreateElement.mockReturnValue( mockElement );

		// Act.
		createElements( {
			elements: [
				{
					container: mockParent,
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
