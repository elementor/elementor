import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { numberPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen, within } from '@testing-library/react';

import * as boundPropContext from '../../bound-prop-context';
import * as useQueryAutocompleteModule from '../../hooks/use-query-autocomplete';
import { QuerySelectControl } from '../query-select-control';

const propType = createMockPropType( { kind: 'object' } );
const setValue = jest.fn();

const makeQueryValue = ( id: number, label: string ) => ( {
	id: numberPropTypeUtil.create( id ),
	label: stringPropTypeUtil.create( label ),
} );

jest.mock( '../../bound-prop-context', () => ( {
	...jest.requireActual( '../../bound-prop-context' ),
	useBoundProp: jest.fn(),
} ) );

jest.mock( '../../hooks/use-query-autocomplete', () => ( {
	...jest.requireActual( '../../hooks/use-query-autocomplete' ),
	useQueryAutocomplete: jest.fn(),
} ) );

const mockUseBoundProp = boundPropContext.useBoundProp as jest.MockedFunction< typeof boundPropContext.useBoundProp >;
const mockUseQueryAutocomplete = useQueryAutocompleteModule.useQueryAutocomplete as jest.MockedFunction<
	typeof useQueryAutocompleteModule.useQueryAutocomplete
>;

const queryOptions = {
	url: '/elementor/v1/post',
	params: { included_types: [ 'elementor_library' ] },
};

const mockBoundValue = ( value: ReturnType< typeof makeQueryValue > | null ) => {
	mockUseBoundProp.mockReturnValue( {
		value,
		setValue,
		disabled: false,
		propType,
		bind: 'popup-id',
		path: [],
		resetValue: jest.fn(),
		restoreValue: jest.fn(),
	} );
};

describe( 'QuerySelectControl', () => {
	beforeEach( () => {
		setValue.mockClear();
		mockBoundValue( null );
		mockUseQueryAutocomplete.mockReturnValue( {
			options: [
				{ id: '12', label: 'Newsletter' },
				{ id: '34', label: 'Thank you' },
			],
			updateOptions: jest.fn(),
		} );
	} );

	it( 'opens the options list on focus without typing', () => {
		// Arrange.
		const props = { setValue, value: null, bind: 'popup-id', propType };

		// Act.
		renderControl( <QuerySelectControl queryOptions={ queryOptions } />, props );

		fireEvent.mouseDown( screen.getByRole( 'combobox' ) );

		// Assert.
		const listbox = screen.getByRole( 'listbox' );

		expect( within( listbox ).getByText( 'Newsletter' ) ).toBeInTheDocument();
		expect( within( listbox ).getByText( 'Thank you' ) ).toBeInTheDocument();
		expect( mockUseQueryAutocomplete ).toHaveBeenCalledWith( expect.objectContaining( { minInputLength: 0 } ) );
	} );

	it( 'sets the query value when picking an option', () => {
		// Arrange.
		const props = { setValue, value: null, bind: 'popup-id', propType };

		// Act.
		renderControl( <QuerySelectControl queryOptions={ queryOptions } />, props );

		fireEvent.mouseDown( screen.getByRole( 'combobox' ) );
		fireEvent.click( within( screen.getByRole( 'listbox' ) ).getByText( 'Thank you' ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( makeQueryValue( 34, 'Thank you' ) );
	} );

	it( 'displays the selected option label', () => {
		// Arrange.
		const value = makeQueryValue( 99, 'Old popup' );

		mockBoundValue( value );

		// Act.
		renderControl( <QuerySelectControl queryOptions={ queryOptions } />, {
			setValue,
			value,
			bind: 'popup-id',
			propType,
		} );

		// Assert.
		expect( screen.getByRole( 'combobox' ) ).toHaveValue( 'Old popup' );
	} );

	it( 'displays a previously-saved query value that is absent from the fetched options', () => {
		// Arrange.
		const value = makeQueryValue( 12, 'Saved popup' );

		mockBoundValue( value );
		mockUseQueryAutocomplete.mockReturnValue( {
			options: [ { id: '34', label: 'Thank you' } ],
			updateOptions: jest.fn(),
		} );

		// Act.
		renderControl( <QuerySelectControl queryOptions={ queryOptions } />, {
			setValue,
			value,
			bind: 'popup-id',
			propType,
		} );

		// Assert.
		expect( screen.getByRole( 'combobox' ) ).toHaveValue( 'Saved popup' );
	} );

	it( 'searches only when the user types', () => {
		// Arrange.
		const updateOptions = jest.fn();

		mockUseQueryAutocomplete.mockReturnValue( { options: [], updateOptions } );

		// Act.
		renderControl( <QuerySelectControl queryOptions={ queryOptions } />, {
			setValue,
			value: null,
			bind: 'popup-id',
			propType,
		} );

		fireEvent.change( screen.getByRole( 'combobox' ), { target: { value: 'news' } } );

		// Assert.
		expect( updateOptions ).toHaveBeenCalledWith( 'news' );
	} );

	it( 'resets options after selecting so reopening shows the full list', () => {
		// Arrange.
		const updateOptions = jest.fn();

		mockUseQueryAutocomplete.mockReturnValue( {
			options: [
				{ id: '12', label: 'Newsletter' },
				{ id: '34', label: 'Thank you' },
			],
			updateOptions,
		} );

		renderControl( <QuerySelectControl queryOptions={ queryOptions } />, {
			setValue,
			value: null,
			bind: 'popup-id',
			propType,
		} );

		// Act – open and select an item (triggers onInputChange with reason 'reset').
		fireEvent.mouseDown( screen.getByRole( 'combobox' ) );
		fireEvent.click( within( screen.getByRole( 'listbox' ) ).getByText( 'Newsletter' ) );

		// Assert.
		expect( updateOptions ).toHaveBeenCalledWith( null );
	} );

	it( 'clears the value when the clear button is clicked', () => {
		// Arrange.
		const value = makeQueryValue( 12, 'Newsletter' );

		mockBoundValue( value );

		// Act.
		renderControl( <QuerySelectControl queryOptions={ queryOptions } />, {
			setValue,
			value,
			bind: 'popup-id',
			propType,
		} );

		fireEvent.click( screen.getByTitle( 'Clear' ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'disables the combobox when the bound prop is disabled', () => {
		// Arrange.
		mockUseBoundProp.mockReturnValue( {
			value: null,
			setValue,
			disabled: true,
			propType,
			bind: 'popup-id',
			path: [],
			resetValue: jest.fn(),
			restoreValue: jest.fn(),
		} );

		// Act.
		renderControl( <QuerySelectControl queryOptions={ queryOptions } />, {
			setValue,
			value: null,
			bind: 'popup-id',
			propType,
		} );

		// Assert.
		expect( screen.getByRole( 'combobox' ) ).toBeDisabled();
	} );

	it( 'applies the aria-label to the input when ariaLabel prop is given', () => {
		// Act.
		renderControl( <QuerySelectControl queryOptions={ queryOptions } ariaLabel="Choose a popup" />, {
			setValue,
			value: null,
			bind: 'popup-id',
			propType,
		} );

		// Assert.
		expect( screen.getByRole( 'combobox' ) ).toHaveAccessibleName( 'Choose a popup' );
	} );
} );
