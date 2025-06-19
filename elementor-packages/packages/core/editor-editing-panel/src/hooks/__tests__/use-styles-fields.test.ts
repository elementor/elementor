import { act } from 'react';
import { createMockStylesProvider, mockHistoryManager } from 'test-utils';
import {
	createElementStyle,
	type CreateElementStyleArgs,
	deleteElementStyle,
	getElementLabel,
} from '@elementor/editor-elements';
import { renderHook } from '@testing-library/react';

import { useClassesProp } from '../../contexts/classes-prop-context';
import { useElement } from '../../contexts/element-context';
import { useStyle } from '../../contexts/style-context';
import { useStylesFields } from '../use-styles-fields';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../contexts/element-context' );
jest.mock( '../../contexts/style-context' );
jest.mock( '../../contexts/classes-prop-context' );

type StyleValue = ReturnType< typeof useStyle >;

describe( 'useStylesFields', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		historyMock.beforeEach();

		jest.mocked( useElement ).mockReturnValue( {
			element: {
				id: 'test-element-id',
				type: 'test',
			},
			elementType: {
				key: 'test',
				controls: [],
				title: 'Test',
				propsSchema: {},
			},
		} );
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	it( 'should create an element style when there is no active style, delete on undo, and re-create on redo', () => {
		// Arrange.
		jest.mocked( useStyle ).mockReturnValue( {
			id: null,
			provider: null,
			meta: {
				breakpoint: null,
				state: null,
			},
		} as StyleValue );

		jest.mocked( createElementStyle ).mockReturnValue( 'test-style-id' );

		jest.mocked( useClassesProp ).mockReturnValue( 'test-classes-prop' );

		jest.mocked( getElementLabel ).mockImplementation( ( id ) => {
			return id === 'test-element-id' ? 'Test Element' : '';
		} );

		const { result } = renderHook( () => useStylesFields< { testProp: string } >( [ 'testProp' ] ) );

		// Act.
		result.current.setValues( { testProp: 'test-value' } );

		// Assert - Style created.
		const createArgs = {
			elementId: 'test-element-id',
			meta: { breakpoint: null, state: null },
			props: { testProp: 'test-value' },
			label: 'local',
			classesProp: 'test-classes-prop',
		} satisfies CreateElementStyleArgs;

		expect( createElementStyle ).toHaveBeenCalledTimes( 1 );
		expect( createElementStyle ).toHaveBeenCalledWith( createArgs );

		const historyItem = historyMock.instance.get();

		expect( historyItem?.title ).toBe( 'Test Element' );
		expect( historyItem?.subTitle ).toBe( 'Style edited' );

		// Act - Undo.
		act( () => {
			historyMock.instance.undo();
		} );

		// Assert - Style deleted.
		expect( deleteElementStyle ).toHaveBeenCalledTimes( 1 );
		expect( deleteElementStyle ).toHaveBeenCalledWith( 'test-element-id', 'test-style-id' );

		// Act - Redo.
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert - Style re-created.
		expect( createElementStyle ).toHaveBeenCalledTimes( 2 );
		expect( createElementStyle ).toHaveBeenNthCalledWith( 2, {
			...createArgs,
			styleId: 'test-style-id',
		} );
	} );

	it( 'should update a prop value, re-render, revert to previous props on undo, and set new props on redo', () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( {}, [
			{
				id: 'test-style-id',
				type: 'class',
				label: 'Test',
				variants: [
					{
						props: {
							prop1: 'value1-normal',
							prop2: 'value2-normal',
						},
						meta: { breakpoint: null, state: null },
					},
					{
						props: {
							prop1: 'value1-hover',
							prop2: 'value2-hover',
						},
						meta: { breakpoint: null, state: 'hover' },
					},
				],
			},
		] );

		jest.mocked( useStyle ).mockReturnValue( {
			id: 'test-style-id',
			provider: mockProvider,
			meta: {
				breakpoint: null,
				state: 'hover',
			},
			setId: jest.fn(),
			setMetaState: jest.fn(),
		} );

		// Act - Initial render.
		const { result } = renderHook( () => useStylesFields< { prop1: string } >( [ 'prop1' ] ) );

		// Assert
		expect( result.current.values?.prop1 ).toBe( 'value1-hover' );

		// Act - Update prop value.
		act( () => {
			result.current.setValues( { prop1: 'updated-value' } );
		} );

		// Assert.
		const historyItem = historyMock.instance.get();

		expect( result.current.values?.prop1 ).toBe( 'updated-value' );
		expect( historyItem?.title ).toBe( 'Test Element' );
		expect( historyItem?.subTitle ).toBe( 'Style edited' );

		// Act - Undo.
		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( result.current.values?.prop1 ).toBe( 'value1-hover' );

		// Act - Redo.
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( result.current.values?.prop1 ).toBe( 'updated-value' );
	} );
} );
