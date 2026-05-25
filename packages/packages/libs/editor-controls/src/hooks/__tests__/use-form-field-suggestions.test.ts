import {
	createMockChild,
	createMockContainer,
	createMockPropType,
	dispatchCommandAfter,
	dispatchV1ReadyEvent,
} from 'test-utils';
import { getContainer, getSelectedElements, getWidgetsCache } from '@elementor/editor-elements';
import { act, renderHook } from '@testing-library/react';

import { useFormFieldSuggestions } from '../use-form-field-suggestions';

jest.mock( '@elementor/editor-elements', () => ( {
	getContainer: jest.fn(),
	getSelectedElements: jest.fn(),
	getWidgetsCache: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );
const mockGetSelectedElements = jest.mocked( getSelectedElements );
const mockGetWidgetsCache = jest.mocked( getWidgetsCache );

function createFormFieldChild( id: string, widgetType: string, settings: Record< string, unknown > = {} ) {
	const child = createMockChild( { id, elType: 'widget', widgetType } );

	Object.entries( settings ).forEach( ( [ key, value ] ) => {
		const settingValue = typeof value === 'string' ? { $$type: 'string', value } : value;

		child.settings.set( key, settingValue as never );
	} );

	return child;
}

describe( 'useFormFieldSuggestions', () => {
	beforeEach( () => {
		mockGetContainer.mockClear();
		mockGetSelectedElements.mockClear();
		mockGetWidgetsCache.mockReturnValue( null );
	} );

	it( 'should return empty array when nothing is selected', () => {
		mockGetSelectedElements.mockReturnValue( [] );

		const { result } = renderHook( () => useFormFieldSuggestions() );

		expect( result.current ).toEqual( [] );
	} );

	it( 'should include select, date picker, and time picker fields by css id', () => {
		const form = createMockContainer(
			'form-1',
			[
				createFormFieldChild( 'select-1', 'e-form-select', { _cssid: 'country' } ),
				createFormFieldChild( 'date-1', 'e-form-date-picker', { _cssid: 'appointment-date' } ),
				createFormFieldChild( 'time-1', 'e-form-time-picker', { _cssid: 'appointment-time' } ),
			],
			'e-form'
		);

		mockGetSelectedElements.mockReturnValue( [ { id: 'form-1', type: 'e-form' } ] );
		mockGetContainer.mockReturnValue( form );

		const { result } = renderHook( () => useFormFieldSuggestions() );

		expect( result.current ).toEqual(
			expect.arrayContaining( [
				{ label: 'country', value: 'country' },
				{ label: 'appointment-date', value: 'appointment-date' },
				{ label: 'appointment-time', value: 'appointment-time' },
			] )
		);
	} );

	it( 'should use schema default css id when settings are empty', () => {
		const selectField = createFormFieldChild( 'select-1', 'e-form-select' );
		const form = createMockContainer( 'form-1', [ selectField ], 'e-form' );

		mockGetWidgetsCache.mockReturnValue( {
			'e-form-select': {
				title: 'Select',
				controls: {},
				atomic_props_schema: {
					_cssid: createMockPropType( {
						kind: 'plain',
						key: 'string',
						default: { $$type: 'string', value: 'e-form-select-13' },
					} ),
				},
			},
		} );

		mockGetSelectedElements.mockReturnValue( [ { id: 'form-1', type: 'e-form' } ] );
		mockGetContainer.mockReturnValue( form );

		const { result } = renderHook( () => useFormFieldSuggestions() );

		expect( result.current ).toEqual( [ { label: 'e-form-select-13', value: 'e-form-select-13' } ] );
	} );

	it( 'should deduplicate suggestions when multiple fields share the same css id', () => {
		const form = createMockContainer(
			'form-1',
			[
				createFormFieldChild( 'select-1', 'e-form-select', { _cssid: 'e-form-select-13' } ),
				createFormFieldChild( 'select-2', 'e-form-select', { _cssid: 'e-form-select-13' } ),
			],
			'e-form'
		);

		mockGetSelectedElements.mockReturnValue( [ { id: 'form-1', type: 'e-form' } ] );
		mockGetContainer.mockReturnValue( form );

		const { result } = renderHook( () => useFormFieldSuggestions() );

		expect( result.current ).toEqual( [ { label: 'e-form-select-13', value: 'e-form-select-13' } ] );
	} );

	it( 'should list each field by its css id including radio buttons', () => {
		const form = createMockContainer(
			'form-1',
			[
				createFormFieldChild( 'radio-1', 'e-form-radio-button', {
					name: 'meal',
					_cssid: 'e-form-radio-button-13',
				} ),
				createFormFieldChild( 'radio-2', 'e-form-radio-button', {
					name: 'meal',
					_cssid: 'e-form-radio-button-14',
				} ),
			],
			'e-form'
		);

		mockGetSelectedElements.mockReturnValue( [ { id: 'form-1', type: 'e-form' } ] );
		mockGetContainer.mockReturnValue( form );

		const { result } = renderHook( () => useFormFieldSuggestions() );

		expect( result.current ).toEqual( [
			{ label: 'e-form-radio-button-13', value: 'e-form-radio-button-13' },
			{ label: 'e-form-radio-button-14', value: 'e-form-radio-button-14' },
		] );
	} );

	it( 'should resolve the parent form when a nested field is selected', () => {
		const selectField = createFormFieldChild( 'select-1', 'e-form-select', { _cssid: 'country' } );
		const form = createMockContainer( 'form-1', [ selectField ], 'e-form' );

		selectField.parent = form;

		mockGetSelectedElements.mockReturnValue( [ { id: 'select-1', type: 'e-form-select' } ] );
		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'select-1' ) {
				return selectField;
			}

			return null;
		} );

		const { result } = renderHook( () => useFormFieldSuggestions() );

		expect( result.current ).toEqual( [ { label: 'country', value: 'country' } ] );
	} );

	it( 'should filter email fields when inputType is email', () => {
		const form = createMockContainer(
			'form-1',
			[
				createFormFieldChild( 'input-1', 'e-form-input', { _cssid: 'email', type: 'email' } ),
				createFormFieldChild( 'input-2', 'e-form-input', { _cssid: 'name', type: 'text' } ),
			],
			'e-form'
		);

		mockGetSelectedElements.mockReturnValue( [ { id: 'form-1', type: 'e-form' } ] );
		mockGetContainer.mockReturnValue( form );

		const { result } = renderHook( () => useFormFieldSuggestions( { inputType: 'email' } ) );

		expect( result.current ).toEqual( [ { label: 'email', value: 'email' } ] );
	} );

	it( 'should update when document/elements/set-settings command ends', () => {
		const form = createMockContainer( 'form-1', [], 'e-form' );

		mockGetSelectedElements.mockReturnValue( [ { id: 'form-1', type: 'e-form' } ] );
		mockGetContainer.mockReturnValue( form );

		const { result } = renderHook( () => useFormFieldSuggestions() );

		expect( result.current ).toEqual( [] );

		const updatedForm = createMockContainer(
			'form-1',
			[ createFormFieldChild( 'select-1', 'e-form-select', { _cssid: 'country' } ) ],
			'e-form'
		);

		mockGetContainer.mockReturnValue( updatedForm );

		act( () => {
			dispatchCommandAfter( 'document/elements/set-settings' );
		} );

		expect( result.current ).toEqual( [ { label: 'country', value: 'country' } ] );
	} );

	it( 'should update when V1 ready event is dispatched', () => {
		const form = createMockContainer( 'form-1', [], 'e-form' );

		mockGetSelectedElements.mockReturnValue( [ { id: 'form-1', type: 'e-form' } ] );
		mockGetContainer.mockReturnValue( form );

		const { result } = renderHook( () => useFormFieldSuggestions() );

		const updatedForm = createMockContainer(
			'form-1',
			[ createFormFieldChild( 'date-1', 'e-form-date-picker', { _cssid: 'appointment-date' } ) ],
			'e-form'
		);

		mockGetContainer.mockReturnValue( updatedForm );

		act( () => {
			dispatchV1ReadyEvent();
		} );

		expect( result.current ).toEqual( [ { label: 'appointment-date', value: 'appointment-date' } ] );
	} );
} );
