import { createMockChild, createMockContainer, mockHistoryManager } from 'test-utils';
import { act } from '@testing-library/react';

import { createElement } from '../create-element';
import { deleteElement } from '../delete-element';
import { duplicateElement } from '../duplicate-element';
import { duplicateElements } from '../duplicate-elements';
import { getContainer } from '../get-container';
import { type V1ElementModelProps } from '../types';

jest.mock( '../create-element' );
jest.mock( '../delete-element' );
jest.mock( '../duplicate-element' );
jest.mock( '../get-container' );

describe( 'duplicateElements', () => {
	const historyMock = mockHistoryManager();
	const mockCreateElement = jest.mocked( createElement );
	const mockDeleteElement = jest.mocked( deleteElement );
	const mockDuplicateElement = jest.mocked( duplicateElement );
	const mockGetContainer = jest.mocked( getContainer );

	beforeEach( () => {
		historyMock.beforeEach();
		mockCreateElement.mockClear();
		mockDeleteElement.mockClear();
		mockDuplicateElement.mockClear();
		mockGetContainer.mockClear();
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	it( 'should duplicate multiple elements and return their data', () => {
		// Arrange.
		const {
			mockOriginalElement1,
			mockOriginalElement2,
			mockDuplicatedElement1,
			mockDuplicatedElement2,
			mockParent,
		} = setupMockElementsForDuplication( mockGetContainer );

		mockDuplicateElement
			.mockReturnValueOnce( mockDuplicatedElement1 )
			.mockReturnValueOnce( mockDuplicatedElement2 );

		// Act.
		const duplicateResult = duplicateElements( {
			elementIds: [ 'original-1', 'original-2' ],
			title: 'Duplicate Elements',
			subtitle: 'Elements duplicated',
		} );

		// Assert.
		expect( duplicateResult.duplicatedElements ).toHaveLength( 2 );
		expect( duplicateResult.duplicatedElements[ 0 ].container ).toBe( mockDuplicatedElement1 );
		expect( duplicateResult.duplicatedElements[ 0 ].parentContainer ).toBe( mockParent );
		expect( duplicateResult.duplicatedElements[ 0 ].at ).toBe( 1 );

		expect( duplicateResult.duplicatedElements[ 1 ].container ).toBe( mockDuplicatedElement2 );
		expect( duplicateResult.duplicatedElements[ 1 ].parentContainer ).toBe( mockParent );
		expect( duplicateResult.duplicatedElements[ 1 ].at ).toBe( 2 );

		expect( mockDuplicateElement ).toHaveBeenCalledTimes( 2 );
		expect( mockDuplicateElement ).toHaveBeenNthCalledWith( 1, {
			element: mockOriginalElement1,
			options: { useHistory: false },
		} );
		expect( mockDuplicateElement ).toHaveBeenNthCalledWith( 2, {
			element: mockOriginalElement2,
			options: { useHistory: false },
		} );

		const historyItem = historyMock.instance.get();
		expect( historyItem?.title ).toBe( 'Duplicate Elements' );
		expect( historyItem?.subTitle ).toBe( 'Elements duplicated' );
	} );

	it( 'should delete duplicated elements on undo and recreate them on redo', () => {
		// Arrange.
		const { mockDuplicatedElement1, mockDuplicatedElement2, mockParent } =
			setupMockElementsForDuplication( mockGetContainer );

		mockDuplicateElement
			.mockReturnValueOnce( mockDuplicatedElement1 )
			.mockReturnValueOnce( mockDuplicatedElement2 );

		const mockRecreatedElement1 = createMockChild( { id: 'recreated-1', elType: 'widget', widgetType: 'button' } );
		const mockRecreatedElement2 = createMockChild( { id: 'recreated-2', elType: 'widget', widgetType: 'text' } );

		mockCreateElement.mockReturnValueOnce( mockRecreatedElement1 ).mockReturnValueOnce( mockRecreatedElement2 );

		// Act.
		duplicateElements( {
			elementIds: [ 'original-1', 'original-2' ],
			title: 'Duplicate Elements',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 2 );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 1, {
			container: mockDuplicatedElement2,
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 2, {
			container: mockDuplicatedElement1,
			options: { useHistory: false },
		} );

		// Act.
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockCreateElement ).toHaveBeenCalledTimes( 2 );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 1, {
			container: mockParent,
			model: {
				id: 'duplicated-1',
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Duplicated Button' },
			},
			options: {
				useHistory: false,
				clone: false,
				at: 1,
			},
		} );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 2, {
			container: mockParent,
			model: {
				id: 'duplicated-2',
				elType: 'widget',
				widgetType: 'text',
				settings: { content: 'Duplicated Text' },
			},
			options: {
				useHistory: false,
				clone: false,
				at: 2,
			},
		} );
	} );

	it( 'should skip elements without parent containers', () => {
		// Arrange.
		const mockElementWithoutParent = createMockContainer( 'no-parent', [] );
		mockElementWithoutParent.parent = undefined;

		const { mockOriginalElement1, mockDuplicatedElement1 } = setupMockElementsForDuplication( mockGetContainer );

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'no-parent' ) {
				return mockElementWithoutParent;
			}
			if ( id === 'original-1' ) {
				return mockOriginalElement1;
			}
			return null;
		} );

		mockDuplicateElement.mockReturnValue( mockDuplicatedElement1 );

		// Act.
		const duplicateResult = duplicateElements( {
			elementIds: [ 'no-parent', 'original-1' ],
			title: 'Duplicate Elements',
		} );

		// Assert.
		expect( duplicateResult.duplicatedElements ).toHaveLength( 1 );
		expect( duplicateResult.duplicatedElements[ 0 ].container.id ).toBe( 'duplicated-1' );
		expect( mockDuplicateElement ).toHaveBeenCalledTimes( 1 );
		expect( mockDuplicateElement ).toHaveBeenCalledWith( {
			element: mockOriginalElement1,
			options: { useHistory: false },
		} );
	} );

	it( 'should skip elements that cannot be found by getContainer', () => {
		// Arrange.
		const { mockOriginalElement1, mockDuplicatedElement1 } = setupMockElementsForDuplication( mockGetContainer );

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'non-existent' ) {
				return null;
			}
			if ( id === 'original-1' ) {
				return mockOriginalElement1;
			}
			return null;
		} );

		mockDuplicateElement.mockReturnValue( mockDuplicatedElement1 );

		// Act.
		const duplicateResult = duplicateElements( {
			elementIds: [ 'non-existent', 'original-1' ],
			title: 'Duplicate Elements',
		} );

		// Assert.
		expect( duplicateResult.duplicatedElements ).toHaveLength( 1 );
		expect( duplicateResult.duplicatedElements[ 0 ].container.id ).toBe( 'duplicated-1' );
		expect( mockDuplicateElement ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should use default subtitle when not provided', () => {
		// Arrange.
		const { mockDuplicatedElement1 } = setupMockElementsForDuplication( mockGetContainer );

		mockDuplicateElement.mockReturnValue( mockDuplicatedElement1 );

		// Act.
		duplicateElements( {
			elementIds: [ 'original-1' ],
			title: 'Duplicate Element',
		} );

		// Assert.
		const historyItem = historyMock.instance.get();
		expect( historyItem?.subTitle ).toBe( 'Item duplicated' );
	} );
} );

function setupMockElementsForDuplication( mockGetContainer: jest.Mock ) {
	const mockParent = createMockContainer( 'parent-1', [] );

	const mockOriginalElement1 = createMockContainer( 'original-1', [] );
	mockOriginalElement1.parent = mockParent;

	const mockOriginalElement2 = createMockContainer( 'original-2', [] );
	mockOriginalElement2.parent = mockParent;

	const mockDuplicatedElement1 = createMockChild( {
		id: 'duplicated-1',
		elType: 'widget',
		widgetType: 'button',
	} );
	mockDuplicatedElement1.parent = mockParent;
	mockDuplicatedElement1.view = { _index: 1 };

	const mockElement1ToJSON = jest.spyOn( mockDuplicatedElement1.model, 'toJSON' );
	mockElement1ToJSON.mockReturnValue( {
		id: 'duplicated-1',
		elType: 'widget',
		widgetType: 'button',
		settings: { text: 'Duplicated Button' },
	} as unknown as V1ElementModelProps );

	const mockDuplicatedElement2 = createMockChild( {
		id: 'duplicated-2',
		elType: 'widget',
		widgetType: 'text',
	} );

	mockDuplicatedElement2.parent = mockParent;
	mockDuplicatedElement2.view = { _index: 2 };

	const mockElement2ToJSON = jest.spyOn( mockDuplicatedElement2.model, 'toJSON' );
	mockElement2ToJSON.mockReturnValue( {
		id: 'duplicated-2',
		elType: 'widget',
		widgetType: 'text',
		settings: { content: 'Duplicated Text' },
	} as unknown as V1ElementModelProps );

	mockGetContainer.mockImplementation( ( id: string ) => {
		switch ( id ) {
			case 'original-1':
				return mockOriginalElement1;
			case 'original-2':
				return mockOriginalElement2;
			default:
				return null;
		}
	} );

	return {
		mockParent,
		mockOriginalElement1,
		mockOriginalElement2,
		mockDuplicatedElement1,
		mockDuplicatedElement2,
	};
}
