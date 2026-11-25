import { act, createElement } from 'react';
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
import { StylesFieldTargetsProvider } from '../../contexts/styles-field-targets-context';
import { getElementClassesProp, getElementLocalStyle } from '../../utils/element-local-style';
import { useStylesFields } from '../use-styles-fields';

jest.mock( '../../contexts/element-context' );
jest.mock( '../../contexts/style-context' );
jest.mock( '../../contexts/classes-prop-context' );
jest.mock( '../../utils/element-local-style' );
jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	deleteElementStyle: jest.fn(),
	getElementLabel: jest.fn(),
	createElementStyle: jest.fn(),
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
			settings: {},
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
							meta: { breakpoint: null, state: null },
							props: {
								'prop-1': 'value1-normal',
								'prop-2': 'value2-normal',
							},
							custom_css: null,
						},
						{
							meta: { breakpoint: null, state: 'hover' },
							props: {
								'prop-1': 'value1-hover',
								'prop-2': 'value2-hover',
							},
							custom_css: null,
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

	describe( 'with a targets context', () => {
		const LOCAL_STYLE_ID = 'target-a-local-style';
		const CREATED_STYLE_ID = 'target-b-local-style';
		const META = { breakpoint: null, state: null };

		const createLocalStylesProvider = () =>
			createMockStylesProvider( { key: 'document-elements-1' }, [
				{
					id: LOCAL_STYLE_ID,
					type: 'class',
					label: 'local',
					variants: [ { meta: META, props: { 'test-prop': 'previous-value' }, custom_css: null } ],
				},
			] );

		const renderWithTargets = ( elementIds: string[] ) =>
			renderHook( () => useStylesFields< { 'test-prop': string } >( [ 'test-prop' ] ), {
				wrapper: ( { children } ) => createElement( StylesFieldTargetsProvider, { elementIds }, children ),
			} );

		beforeEach( () => {
			jest.mocked( useClassesProp ).mockReturnValue( 'test-classes-prop' );
			jest.mocked( getElementClassesProp ).mockReturnValue( 'classes' );
			jest.mocked( createElementStyle ).mockReturnValue( CREATED_STYLE_ID );
		} );

		it( "should update one target's local style and create the other's in one history item, undo both and redo with the created id", () => {
			// Arrange.
			const localProvider = createLocalStylesProvider();

			jest.mocked( useStyle ).mockReturnValue( {
				id: LOCAL_STYLE_ID,
				provider: localProvider,
				meta: META,
				setId: jest.fn(),
				setMetaState: jest.fn(),
			} );
			jest.mocked( getElementLocalStyle ).mockImplementation( ( elementId ) =>
				elementId === 'target-a' ? { styleId: LOCAL_STYLE_ID, provider: localProvider } : null
			);
			jest.mocked( getElementLabel ).mockImplementation( ( id ) => ( id === 'target-a' ? 'Target A' : '' ) );

			const { result } = renderWithTargets( [ 'target-a', 'target-b' ] );

			// Act.
			act( () => {
				result.current.setValues( { 'test-prop': 'new-value' }, { history: { propDisplayName: 'Test Prop' } } );
			} );

			jest.runAllTimers();

			// Assert.
			expect( localProvider.actions.updateProps ).toHaveBeenCalledWith(
				{ id: LOCAL_STYLE_ID, meta: META, props: { 'test-prop': 'new-value' } },
				{ elementId: 'target-a' }
			);
			expect( createElementStyle ).toHaveBeenCalledWith( {
				elementId: 'target-b',
				classesProp: 'classes',
				meta: META,
				label: 'local',
				props: { 'test-prop': 'new-value' },
			} );
			expect( historyMock.instance.get()?.title ).toBe( 'Target A' );
			expect( historyMock.instance.get()?.subTitle ).toBe( 'Test Prop edited' );

			// Act.
			act( () => {
				historyMock.instance.undo();
			} );

			// Assert.
			expect( localProvider.actions.updateProps ).toHaveBeenLastCalledWith(
				{ id: LOCAL_STYLE_ID, meta: META, props: { 'test-prop': 'previous-value' }, mode: 'replace' },
				{ elementId: 'target-a' }
			);
			expect( deleteElementStyle ).toHaveBeenCalledWith( 'target-b', CREATED_STYLE_ID );

			// Act.
			act( () => {
				historyMock.instance.redo();
			} );

			// Assert.
			expect( createElementStyle ).toHaveBeenLastCalledWith(
				expect.objectContaining( { elementId: 'target-b', styleId: CREATED_STYLE_ID } )
			);
		} );

		it( "should write the targets' local styles, not the selected global class", () => {
			// Arrange.
			const globalProvider = createMockStylesProvider( { key: 'global-classes' }, [
				{
					id: 'global-class',
					type: 'class',
					label: 'global',
					variants: [ { meta: META, props: {}, custom_css: null } ],
				},
			] );

			jest.mocked( useStyle ).mockReturnValue( {
				id: 'global-class',
				provider: globalProvider,
				meta: META,
				setId: jest.fn(),
				setMetaState: jest.fn(),
			} );
			jest.mocked( getElementLocalStyle ).mockReturnValue( null );

			const { result } = renderWithTargets( [ 'target-a' ] );

			// Act.
			act( () => {
				result.current.setValues( { 'test-prop': 'new-value' }, { history: { propDisplayName: 'Test Prop' } } );
			} );

			jest.runAllTimers();

			// Assert.
			expect( globalProvider.actions.updateProps ).not.toHaveBeenCalled();
			expect( createElementStyle ).toHaveBeenCalledWith( expect.objectContaining( { elementId: 'target-a' } ) );
		} );
	} );
} );
