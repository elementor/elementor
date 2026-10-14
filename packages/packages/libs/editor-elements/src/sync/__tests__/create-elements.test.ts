import { createMockChild, createMockContainer, mockHistoryManager } from 'test-utils';

import { createElement } from '../create-element';
import { createElements } from '../create-elements';
import { deleteElement } from '../delete-element';
import { getContainer } from '../get-container';
import { addModelToParent, removeModelFromParent } from '../resolve-element';

jest.mock( '../create-element' );
jest.mock( '../delete-element' );
jest.mock( '../get-container' );
jest.mock( '../resolve-element', () => ( {
	...jest.requireActual( '../resolve-element' ),
	addModelToParent: jest.fn(),
	removeModelFromParent: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );
const mockAddModelToParent = jest.mocked( addModelToParent );
const mockRemoveModelFromParent = jest.mocked( removeModelFromParent );

describe( 'createElements', () => {
	const historyMock = mockHistoryManager();
	const mockCreateElement = jest.mocked( createElement );
	const mockDeleteElement = jest.mocked( deleteElement );

	beforeEach( () => {
		historyMock.beforeEach();
		mockCreateElement.mockClear();
		mockDeleteElement.mockClear();
		mockGetContainer.mockClear();
		mockAddModelToParent.mockClear();
		mockRemoveModelFromParent.mockClear();
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

	describe( 'model-tree fallback for async-rendered nested elements', () => {
		it( 'should fall back to model-tree removal on undo when views are unavailable', () => {
			// Arrange.
			const mockParent = createMockContainer( 'parent-1', [] );
			const mockElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
			mockCreateElement.mockReturnValueOnce( mockElement );

			createElements( {
				elements: [ { container: mockParent, model: { elType: 'widget', widgetType: 'button' } } ],
				title: 'Add Element',
			} );

			// Act.
			mockElement.lookup = jest.fn().mockReturnValue( null );
			mockGetContainer.mockReturnValue( null );

			historyMock.instance.undo();

			// Assert.
			expect( mockRemoveModelFromParent ).toHaveBeenCalledWith( 'parent-1', 'element-1' );
		} );

		it( 'should fall back to model-tree addition on redo when views are unavailable', () => {
			// Arrange.
			const mockParent = createMockContainer( 'parent-1', [] );
			const mockElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
			mockCreateElement.mockReturnValueOnce( mockElement );

			createElements( {
				elements: [ { container: mockParent, model: { elType: 'widget', widgetType: 'button' } } ],
				title: 'Add Element',
			} );

			historyMock.instance.undo();

			// Act.
			mockParent.lookup = jest.fn().mockReturnValue( null );
			mockGetContainer.mockReturnValue( null );

			historyMock.instance.redo();

			// Assert.
			expect( mockAddModelToParent ).toHaveBeenCalledWith(
				'parent-1',
				expect.objectContaining( { id: 'element-1', elType: 'widget' } )
			);
		} );
	} );
} );
