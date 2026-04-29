import '@testing-library/jest-dom';

import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { type StylesProvider } from '@elementor/editor-styles-repository';
import { useSessionStorage } from '@elementor/session';
import { act, fireEvent, screen } from '@testing-library/react';
import { ControlActionsProvider } from '@elementor/editor-controls';

import { useStyle } from '../../../../contexts/style-context';
import { useStylesField } from '../../../../hooks/use-styles-field';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { PositionSection } from '../position-section';

jest.mock( '@elementor/session' );
jest.mock( '@elementor/editor-styles', () => ( {
	...jest.requireActual( '@elementor/editor-styles' ),
	getStylesSchema: jest.fn(),
} ) );
jest.mock( '@elementor/editor-controls', () => {
	const actual = jest.requireActual( '@elementor/editor-controls' );
	return {
		...actual,
		useBoundProp: jest.fn(),
	};
} );
jest.mock( '../../../../hooks/use-styles-field' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../contexts/style-context' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: () => [],
	useInheritedValues: () => ( {} ),
} ) );

const renderPositionSection = () => {
	return renderField( <PositionSection />, {
		propTypes: {
			position: createMockPropType( { kind: 'plain', key: 'string' } ),
			'inset-block-start': createMockPropType( { kind: 'object', key: 'size' } ),
			'inset-block-end': createMockPropType( { kind: 'object', key: 'size' } ),
			'inset-inline-start': createMockPropType( { kind: 'object', key: 'size' } ),
			'inset-inline-end': createMockPropType( { kind: 'object', key: 'size' } ),
			'z-index': createMockPropType( { kind: 'plain', key: 'number' } ),
			'scroll-margin-top': createMockPropType( { kind: 'object', key: 'size' } ),
		},
	} );
};

describe( '<PositionSection />', () => {
	beforeEach( () => {
		jest.mocked( useStyle ).mockReturnValue( {
			id: 'styleDefId',
			setId: jest.fn(),
			meta: { breakpoint: 'desktop', state: null },
			setMetaState: jest.fn(),
			provider: {} as StylesProvider,
		} );

		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: null,
			setValue: jest.fn(),
		} );
	} );

	it( 'should hide position inputs if position is static', () => {
		// Arrange.
		mockPosition( 'static' );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.queryAllByText( 'Top' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Bottom' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Right' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Left' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Z-index' ) ).toHaveLength( 0 );
	} );

	it( 'should hide position inputs if not selected value', () => {
		// Arrange.
		mockPosition( null );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.queryAllByText( 'Top' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Bottom' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Right' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Left' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Z-index' ) ).toHaveLength( 0 );
	} );

	it( 'should show position inputs if position is not static', () => {
		// Arrange.
		mockPosition( 'relative' );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	it( 'should show position inputs if position is absolute', () => {
		// Arrange.
		mockPosition( 'absolute' );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	it( 'should show position inputs if position is sticky', () => {
		// Arrange.
		mockPosition( 'sticky' );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	it( 'should show position inputs when position value is null but placeholder is non-static', () => {
		// Arrange.
		mockPosition( null );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );
		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: { $$type: 'string', value: 'relative' },
			setValue: jest.fn(),
		} );

		// Act.
		renderPositionSection();

		// Assert — dimensions/z-index should be visible because the inherited placeholder is non-static.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	it( 'should hide position inputs when position value is null and placeholder is static', () => {
		// Arrange.
		mockPosition( null );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );
		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: { $$type: 'string', value: 'static' },
			setValue: jest.fn(),
		} );

		// Act.
		renderPositionSection();

		// Assert — placeholder is static, so no dimensional inputs should appear.
		expect( screen.queryAllByText( 'Top' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Bottom' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Right' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Left' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Z-index' ) ).toHaveLength( 0 );
	} );

	it( 'should show position inputs when position value is null but placeholder is fixed', () => {
		// Arrange.
		mockPosition( null );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );
		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: { $$type: 'string', value: 'fixed' },
			setValue: jest.fn(),
		} );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	it( 'should show position inputs when position value is null but placeholder is sticky', () => {
		// Arrange.
		mockPosition( null );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );
		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: { $$type: 'string', value: 'sticky' },
			setValue: jest.fn(),
		} );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	it( 'should show position inputs when position value is null but placeholder is absolute', () => {
		// Arrange.
		mockPosition( null );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );
		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: { $$type: 'string', value: 'absolute' },
			setValue: jest.fn(),
		} );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	it( 'should show position inputs when both position value and placeholder are non-static', () => {
		// Arrange.
		mockPosition( 'absolute' );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );
		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: { $$type: 'string', value: 'relative' },
			setValue: jest.fn(),
		} );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	it.skip( 'should show anchor offset input in all cases', () => {
		// Arrange.
		mockPosition( 'absolute' );
		mockDimensions( 44 );

		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Anchor offset' ) ).toBeVisible();
	} );
} );

describe( 'Dimensions values persistence', () => {
	beforeEach( () => {
		jest.mocked( useStyle ).mockReturnValue( {
			id: 'styleDefId',
			setId: jest.fn(),
			meta: { breakpoint: 'mobile', state: null },
			setMetaState: jest.fn(),
			provider: {} as StylesProvider,
		} );

		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: null,
			setValue: jest.fn(),
		} );
	} );

	it( 'should save dimension values to history when changing position to static', () => {
		// Arrange.
		mockPosition( 'absolute' );
		mockDimensions( 44 );

		const setHistory = jest.fn();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, setHistory, jest.fn() ] );

		// Act.
		renderPositionSection();

		const select = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( select );

		const staticOption = screen.getByText( 'Static' );
		fireEvent.click( staticOption );

		// Assert.
		expect( useSessionStorage ).toHaveBeenCalledWith( `styles/styleDefId/mobile/null/dimensions` );
		expect( setHistory ).toHaveBeenCalledWith( {
			'inset-block-start': {
				value: {
					size: 44,
					unit: 'px',
				},
				$$type: 'size',
			},
			'inset-block-end': null,
			'inset-inline-start': null,
			'inset-inline-end': null,
			'z-index': null,
		} );
	} );

	it( 'should reset dimension values in the model when changing position to static', () => {
		// Arrange.
		mockPosition( 'absolute' );

		const setStylesFields = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'inset-block-start': {
					value: {
						size: 44,
						unit: 'px',
					},
					$$type: 'size',
				},
			},
			setValues: setStylesFields,
			canEdit: true,
		} );

		// Act.
		renderPositionSection();

		const select = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( select );

		const staticOption = screen.getByText( 'Static' );
		fireEvent.click( staticOption );

		// Assert.
		expect( useStylesFields ).toHaveBeenCalledWith( [
			'inset-block-start',
			'inset-block-end',
			'inset-inline-start',
			'inset-inline-end',
			'z-index',
		] );
		expect( setStylesFields ).toHaveBeenCalledWith(
			{
				'inset-block-start': null,
				'inset-block-end': null,
				'inset-inline-start': null,
				'inset-inline-end': null,
				'z-index': null,
			},
			{ history: { propDisplayName: 'Dimensions' } }
		);
	} );

	it( 'should reset z-index when changing position to static', () => {
		// Arrange.
		const setStylesFields = jest.fn();
		mockPosition( 'absolute' );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'inset-block-start': undefined,
				'inset-block-end': undefined,
				'inset-inline-start': undefined,
				'inset-inline-end': undefined,
				'z-index': 10,
			},
			setValues: setStylesFields,
			canEdit: true,
		} );
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		const select = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( select );

		const staticOption = screen.getByText( 'Static' );
		fireEvent.click( staticOption );

		// Assert.
		expect( setStylesFields ).toHaveBeenCalledWith(
			{
				'inset-block-start': null,
				'inset-block-end': null,
				'inset-inline-start': null,
				'inset-inline-end': null,
				'z-index': null,
			},
			{ history: { propDisplayName: 'Dimensions' } }
		);
	} );

	it( 'should clear position-dependent props when position is cleared via the Clear button (useEffect path)', () => {
		// Arrange.
		const setStylesFields = jest.fn();
		mockPosition( null );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'inset-block-start': { value: { size: 20, unit: 'px' }, $$type: 'size' },
				'inset-block-end': undefined,
				'inset-inline-start': undefined,
				'inset-inline-end': undefined,
				'z-index': 5,
			},
			setValues: setStylesFields,
			canEdit: true,
		} );
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act — mount with position already null (simulates Clear button having been clicked).
		renderPositionSection();

		// Assert — useEffect should have fired and cleared all position-dependent props.
		expect( setStylesFields ).toHaveBeenCalledWith(
			{
				'inset-block-start': null,
				'inset-block-end': null,
				'inset-inline-start': null,
				'inset-inline-end': null,
				'z-index': null,
			},
			{ history: { propDisplayName: 'Dimensions' } }
		);
	} );

	it( `should populate the model's positioning values from history when switching from static to a different position`, () => {
		// Arrange.
		mockPosition( 'static' );

		const setStylesFields = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				position: {
					$$type: 'string',
					value: 'static',
				},
			},
			setValues: setStylesFields,
			canEdit: true,
		} );

		jest.mocked( useSessionStorage ).mockImplementation( () => [
			{
				'inset-inline-start': {
					value: {
						size: 54,
						unit: 'px',
					},
					$$type: 'size',
				},
			},
			jest.fn(),
			jest.fn(),
		] );

		// Act.
		renderPositionSection();

		const select = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( select );

		const absoluteOption = screen.getByText( 'Absolute' );
		fireEvent.click( absoluteOption );

		// Assert.
		expect( useSessionStorage ).toHaveBeenCalledWith( 'styles/styleDefId/mobile/null/dimensions' );
		expect( useStylesFields ).toHaveBeenCalledWith( [
			'inset-block-start',
			'inset-block-end',
			'inset-inline-start',
			'inset-inline-end',
			'z-index',
		] );

		expect( setStylesFields ).toHaveBeenCalledWith(
			{
				'inset-inline-start': {
					value: {
						size: 54,
						unit: 'px',
					},
					$$type: 'size',
				},
			},
			{ history: { propDisplayName: 'Dimensions' } }
		);
	} );
} );

describe( 'Auto-set position from placeholder', () => {
	beforeEach( () => {
		jest.mocked( useStyle ).mockReturnValue( {
			id: 'styleDefId',
			setId: jest.fn(),
			meta: { breakpoint: 'desktop', state: null },
			setMetaState: jest.fn(),
			provider: {} as StylesProvider,
		} );

		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: null,
			setValue: jest.fn(),
		} );

		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );
	} );

	it( 'should auto-set position to the placeholder value when dependent values change and position is unset', () => {
		// Arrange — start with no dimensions so the initial effect fires harmlessly.
		const setPosition = jest.fn();
		jest.mocked( useStylesField ).mockReturnValue( {
			value: null,
			setValue: setPosition,
			canEdit: true,
		} );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {},
			setValues: jest.fn(),
			canEdit: true,
		} );
		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: { $$type: 'string', value: 'relative' },
			setValue: jest.fn(),
		} );

		const { rerender } = renderPositionSection();

		// Simulate a dependent value being set (e.g. user sets a top offset on this breakpoint).
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'inset-block-start': { $$type: 'size', value: { size: 20, unit: 'px' } },
			},
			setValues: jest.fn(),
			canEdit: true,
		} );

		act( () => {
			rerender(
				<ControlActionsProvider items={ [] }>
					<PositionSection />
				</ControlActionsProvider>
			);
		} );

		// Assert — position should be auto-set to the inherited placeholder value.
		expect( setPosition ).toHaveBeenCalledWith( { $$type: 'string', value: 'relative' } );
	} );

	it( 'should NOT auto-set position when all dependent values are null after a change', () => {
		// Arrange — start with a non-null value so we can re-render with all-null values.
		const setPosition = jest.fn();
		jest.mocked( useStylesField ).mockReturnValue( {
			value: null,
			setValue: setPosition,
			canEdit: true,
		} );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'inset-block-start': { $$type: 'size', value: { size: 10, unit: 'px' } } },
			setValues: jest.fn(),
			canEdit: true,
		} );
		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: { $$type: 'string', value: 'relative' },
			setValue: jest.fn(),
		} );

		const { rerender } = renderPositionSection();
		setPosition.mockClear();

		// Simulate all dependent values being cleared.
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'inset-block-start': null,
				'inset-block-end': null,
				'inset-inline-start': null,
				'inset-inline-end': null,
				'z-index': null,
			},
			setValues: jest.fn(),
			canEdit: true,
		} );

		act( () => {
			rerender(
				<ControlActionsProvider items={ [] }>
					<PositionSection />
				</ControlActionsProvider>
			);
		} );

		// Assert — all values are null so position should not be auto-set.
		expect( setPosition ).not.toHaveBeenCalledWith( { $$type: 'string', value: 'relative' } );
	} );

	it( 'should NOT auto-set position when position is null and placeholder is null', () => {
		// Arrange.
		const setPosition = jest.fn();
		jest.mocked( useStylesField ).mockReturnValue( {
			value: null,
			setValue: setPosition,
			canEdit: true,
		} );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'inset-block-start': { $$type: 'size', value: { size: 20, unit: 'px' } },
			},
			setValues: jest.fn(),
			canEdit: true,
		} );

		// useBoundProp returns no placeholder (default mock has placeholder: null).

		// Act.
		renderPositionSection();

		// Assert — no placeholder so position should not be auto-set.
		expect( setPosition ).not.toHaveBeenCalled();
	} );

	it( 'should NOT auto-set position when position is already set', () => {
		// Arrange.
		const setPosition = jest.fn();
		jest.mocked( useStylesField ).mockReturnValue( {
			value: { $$type: 'string', value: 'absolute' },
			setValue: setPosition,
			canEdit: true,
		} );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'inset-block-start': { $$type: 'size', value: { size: 20, unit: 'px' } },
			},
			setValues: jest.fn(),
			canEdit: true,
		} );
		jest.mocked( useBoundProp ).mockReturnValue( {
			bind: 'position',
			value: null,
			propType: createMockPropType( { kind: 'plain', key: 'string' } ),
			path: [ 'position' ],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
			placeholder: { $$type: 'string', value: 'relative' },
			setValue: jest.fn(),
		} );

		// Act.
		renderPositionSection();

		// Assert — position is already set, so it should not be overwritten.
		expect( setPosition ).not.toHaveBeenCalled();
	} );

	it( 'should NOT clear position-dependent props when position is static via the useEffect path', () => {
		// Arrange — position is explicitly 'static' (not null), so useEffect should NOT clear.
		const setStylesFields = jest.fn();
		jest.mocked( useStylesField ).mockReturnValue( {
			value: { $$type: 'string', value: 'static' },
			setValue: jest.fn(),
			canEdit: true,
		} );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'inset-block-start': { $$type: 'size', value: { size: 20, unit: 'px' } },
			},
			setValues: setStylesFields,
			canEdit: true,
		} );

		// Act.
		renderPositionSection();

		// Assert — the useEffect only clears when position is null, not when it's 'static'.
		expect( setStylesFields ).not.toHaveBeenCalled();
	} );
} );

// mock functions
function mockPosition( position: string | null ) {
	jest.mocked( useStylesField ).mockReturnValue( {
		value: position
			? {
					$$type: 'string',
					value: position,
			  }
			: null,
		setValue: jest.fn(),
		canEdit: true,
	} );
}

function mockDimensions( size?: number ) {
	jest.mocked( useStylesFields ).mockReturnValue( {
		values: {
			'inset-block-start': {
				value: {
					size: size ?? 0,
					unit: 'px',
				},
				$$type: 'size',
			},
		},
		setValues: jest.fn(),
		canEdit: true,
	} );
}
