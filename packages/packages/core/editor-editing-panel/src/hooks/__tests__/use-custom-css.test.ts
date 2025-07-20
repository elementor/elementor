import { act } from 'react';
import { createMockStylesProvider, mockHistoryManager } from 'test-utils';
import { createElementStyle } from '@elementor/editor-elements';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { encodeString } from '@elementor/utils';
import { renderHook } from '@testing-library/react';

import { useClassesProp } from '../../contexts/classes-prop-context';
import { useElement } from '../../contexts/element-context';
import { useStyle } from '../../contexts/style-context';
import { useCustomCss } from '../use-custom-css';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../contexts/element-context' );
jest.mock( '../../contexts/style-context' );
jest.mock( '../../contexts/classes-prop-context' );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	isExperimentActive: jest.fn().mockReturnValue( false ),
} ) );

describe( 'useCustomCss', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		historyMock.beforeEach();
		jest.useFakeTimers();
		jest.mocked( useElement ).mockReturnValue( {
			element: { id: 'test-element-id', type: 'test' },
			elementType: { key: 'test', controls: [], title: 'Test', propsSchema: {} },
		} );
		jest.mocked( isExperimentActive ).mockImplementation(
			( experimentName: string ) => experimentName === 'e_v_3_31'
		);
	} );

	afterEach( () => {
		historyMock.afterEach();
		jest.clearAllMocks();
	} );

	it( 'should read customCss from the style variant', () => {
		// Act.
		const mockProvider = createMockStylesProvider( {}, [
			{
				id: 'test-style-id',
				type: 'class',
				label: 'test-class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: {},
						custom_css: { raw: encodeString( '.foo { color: red; }' ) },
					},
				],
			},
		] );

		jest.mocked( useStyle ).mockReturnValue( {
			id: 'test-style-id',
			provider: mockProvider,
			meta: { breakpoint: null, state: null },
		} as never );
		jest.mocked( useClassesProp ).mockReturnValue( 'test-classes-prop' );

		// Act.
		const { result } = renderHook( () => useCustomCss() );

		// Assert.
		expect( result.current.customCss ).toEqual( { raw: '.foo { color: red; }' } );
	} );

	it( 'should return null if no customCss is set', () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( {}, [
			{
				id: 'test-style-id',
				type: 'class',
				label: 'test-class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: {},
						custom_css: null,
					},
				],
			},
		] );

		jest.mocked( useStyle ).mockReturnValue( {
			id: 'test-style-id',
			provider: mockProvider,
			meta: { breakpoint: null, state: null },
		} as never );
		jest.mocked( useClassesProp ).mockReturnValue( 'test-classes-prop' );

		// Act.
		const { result } = renderHook( () => useCustomCss() );

		// Assert.
		expect( result.current.customCss ).toBeNull();
	} );

	it( 'should set customCss and create a style if needed', () => {
		// Arrange.
		jest.mocked( useStyle ).mockReturnValue( {
			id: null,
			provider: null,
			meta: { breakpoint: null, state: null },
		} as never );
		jest.mocked( createElementStyle ).mockReturnValue( 'test-style-id' );
		jest.mocked( useClassesProp ).mockReturnValue( 'test-classes-prop' );

		// Act.
		const { result } = renderHook( () => useCustomCss() );

		act( () => {
			result.current.setCustomCss( '.bar { color: blue; }', { history: { propDisplayName: 'Custom CSS' } } );
		} );

		jest.runAllTimers();

		// Assert.
		expect( createElementStyle ).toHaveBeenCalledWith( {
			elementId: 'test-element-id',
			meta: { breakpoint: null, state: null },
			props: {},
			label: 'local',
			classesProp: 'test-classes-prop',
			custom_css: { raw: encodeString( '.bar { color: blue; }' ) },
			styleId: undefined,
		} );
	} );

	it( 'should sanitize whitespace/empty customCss to empty string', () => {
		// Arrange.
		jest.mocked( useStyle ).mockReturnValue( {
			id: null,
			provider: null,
			meta: { breakpoint: null, state: null },
		} as never );
		jest.mocked( createElementStyle ).mockReturnValue( 'test-style-id' );
		jest.mocked( useClassesProp ).mockReturnValue( 'test-classes-prop' );

		// Act.
		const { result } = renderHook( () => useCustomCss() );

		act( () => {
			result.current.setCustomCss( '   \n\t', { history: { propDisplayName: 'Custom CSS' } } );
		} );

		jest.runAllTimers();

		// Assert.
		expect( createElementStyle ).toHaveBeenCalledWith( expect.objectContaining( { custom_css: { raw: '' } } ) );
	} );

	it( 'should support undo/redo of customCss changes', () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( {}, [
			{
				id: 'test-style-id',
				type: 'class',
				label: 'test-class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: {},
						custom_css: { raw: 'old' },
					},
				],
			},
		] );

		const updateCustomCss = jest.fn();

		mockProvider.actions.updateCustomCss = updateCustomCss;

		jest.mocked( useStyle ).mockReturnValue( {
			id: 'test-style-id',
			provider: mockProvider,
			meta: { breakpoint: null, state: null },
		} as never );

		jest.mocked( useClassesProp ).mockReturnValue( 'test-classes-prop' );

		// Act.
		const { result } = renderHook( () => useCustomCss() );

		act( () => {
			result.current.setCustomCss( 'new', { history: { propDisplayName: 'Custom CSS' } } );
		} );

		jest.runAllTimers();

		expect( updateCustomCss ).toHaveBeenCalledWith(
			expect.objectContaining( { custom_css: { raw: encodeString( 'new' ) } } ),
			{
				elementId: 'test-element-id',
			}
		);

		act( () => {
			historyMock.instance.undo();
		} );

		act( () => {
			historyMock.instance.redo();
		} );

		expect( updateCustomCss ).toHaveBeenCalledTimes( 3 );
	} );
} );
