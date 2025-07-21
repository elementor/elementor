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
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	isExperimentActive: jest.fn().mockReturnValue( false ),
} ) );

type StyleValue = ReturnType< typeof useStyle >;

describe( 'useStylesFields', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		historyMock.beforeEach();

		jest.useFakeTimers();

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

		jest.mocked( getElementLabel ).mockImplementation( ( id ) => {
			return id === 'test-element-id' ? 'Test Element' : '';
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

		const { result } = renderHook( () => useStylesFields< { 'test-prop': string } >( [ 'test-prop' ] ) );

		// Act.
		result.current.setValues( { 'test-prop': 'test-value' }, { history: { propDisplayName: 'Test Prop' } } );

		jest.runAllTimers();

		// Assert - Style created.
		const createArgs = {
			elementId: 'test-element-id',
			meta: { breakpoint: null, state: null },
			props: { 'test-prop': 'test-value' },
			label: 'local',
			classesProp: 'test-classes-prop',
		} satisfies CreateElementStyleArgs;

		expect( createElementStyle ).toHaveBeenCalledTimes( 1 );
		expect( createElementStyle ).toHaveBeenCalledWith( createArgs );

		const historyItem = historyMock.instance.get();

		expect( historyItem?.title ).toBe( 'Test Element' );
		expect( historyItem?.subTitle ).toBe( 'Test Prop edited' );

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
		const mockProvider = createMockStylesProvider(
			{
				labels: {
					singular: 'Class',
					plural: 'Classes',
				},
			},
			[
				{
					id: 'test-style-id',
					type: 'class',
					label: 'test-class',
					variants: [
						{
							props: {
								'prop-1': 'value1-normal',
								'prop-2': 'value2-normal',
							},
							meta: { breakpoint: null, state: null },
						},
						{
							props: {
								'prop-1': 'value1-hover',
								'prop-2': 'value2-hover',
							},
							meta: { breakpoint: null, state: 'hover' },
						},
					],
				},
			]
		);

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
		const { result } = renderHook( () => useStylesFields< { 'prop-1': string } >( [ 'prop-1' ] ) );

		// Assert
		expect( result.current.values?.[ 'prop-1' ] ).toBe( 'value1-hover' );

		// Act - Update prop value.
		act( () => {
			result.current.setValues( { 'prop-1': 'updated-value' }, { history: { propDisplayName: 'Prop 1' } } );
		} );

		jest.runAllTimers();

		// Assert.
		const historyItem = historyMock.instance.get();

		expect( result.current.values?.[ 'prop-1' ] ).toBe( 'updated-value' );
		expect( historyItem?.title ).toBe( 'Class' );
		expect( historyItem?.subTitle ).toBe( 'test-class Prop 1 edited' );

		// Act - Undo.
		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( result.current.values?.[ 'prop-1' ] ).toBe( 'value1-hover' );

		// Act - Redo.
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( result.current.values?.[ 'prop-1' ] ).toBe( 'updated-value' );
	} );
} );
