import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen, within } from '@testing-library/react';

import * as boundPropContext from '../../bound-prop-context';
import * as useQueryAutocompleteModule from '../../hooks/use-query-autocomplete';
import { QueryChipsControl } from '../query-chips-control';

const propType = createMockPropType( { kind: 'array' } );
const setValue = jest.fn();

const wrapQuery = ( id: number, label: string ) => ( {
	$$type: 'query' as const,
	value: {
		id: { $$type: 'number' as const, value: id },
		label: { $$type: 'string' as const, value: label },
	},
} );

jest.mock( '../../bound-prop-context', () => ( {
	...jest.requireActual( '../../bound-prop-context' ),
	useBoundProp: jest.fn(),
} ) );

jest.mock( '../../hooks/use-query-autocomplete', () => ( {
	useQueryAutocomplete: jest.fn(),
} ) );

const mockUseBoundProp = boundPropContext.useBoundProp as jest.MockedFunction< typeof boundPropContext.useBoundProp >;
const mockUseQueryAutocomplete = useQueryAutocompleteModule.useQueryAutocomplete as jest.MockedFunction<
	typeof useQueryAutocompleteModule.useQueryAutocomplete
>;

const queryOptions = {
	url: '/elementor/v1/post',
	params: { included_types: [ 'post', 'page' ] },
};

describe( 'QueryChipsControl', () => {
	beforeEach( () => {
		setValue.mockClear();
		mockUseBoundProp.mockReturnValue( {
			value: [],
			setValue,
			disabled: false,
			propType,
			bind: 'selection',
			path: [],
			resetValue: jest.fn(),
			restoreValue: jest.fn(),
		} );
		mockUseQueryAutocomplete.mockReturnValue( {
			options: [
				{ id: '12', label: 'Hello World' },
				{ id: '34', label: 'Sample Page' },
			],
			updateOptions: jest.fn(),
		} );
	} );

	it( 'renders empty combobox when no chips selected', () => {
		// Arrange.
		const props = { setValue, value: [], bind: 'selection', propType };

		// Act.
		renderControl( <QueryChipsControl queryOptions={ queryOptions } />, props );

		// Assert.
		expect( screen.getByRole( 'combobox' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Hello World' ) ).not.toBeInTheDocument();
	} );

	it( 'renders chips for existing query-array value', () => {
		// Arrange.
		const value = [ wrapQuery( 12, 'Hello World' ), wrapQuery( 34, 'Sample Page' ) ];

		mockUseBoundProp.mockReturnValue( {
			value,
			setValue,
			disabled: false,
			propType,
			bind: 'selection',
			path: [],
			resetValue: jest.fn(),
			restoreValue: jest.fn(),
		} );

		// Act.
		renderControl( <QueryChipsControl queryOptions={ queryOptions } />, {
			setValue,
			value,
			bind: 'selection',
			propType,
		} );

		// Assert.
		expect( screen.getByText( 'Hello World' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Sample Page' ) ).toBeInTheDocument();
	} );

	it( 'adds a chip when picking a suggestion from the dropdown', () => {
		// Arrange.
		const props = { setValue, value: [], bind: 'selection', propType };

		// Act.
		renderControl( <QueryChipsControl queryOptions={ queryOptions } />, props );

		const input = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( input );

		const listbox = screen.getByRole( 'listbox' );
		fireEvent.click( within( listbox ).getByText( 'Hello World' ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( [ wrapQuery( 12, 'Hello World' ) ] );
	} );

	it( 'removes a chip when clicking its delete icon', () => {
		// Arrange.
		const value = [ wrapQuery( 12, 'Hello World' ), wrapQuery( 34, 'Sample Page' ) ];

		mockUseBoundProp.mockReturnValue( {
			value,
			setValue,
			disabled: false,
			propType,
			bind: 'selection',
			path: [],
			resetValue: jest.fn(),
			restoreValue: jest.fn(),
		} );

		// Act.
		renderControl( <QueryChipsControl queryOptions={ queryOptions } />, {
			setValue,
			value,
			bind: 'selection',
			propType,
		} );

		const chips = screen.getAllByRole( 'button' );
		const helloChip = chips.find( ( chip ) => chip.textContent?.includes( 'Hello World' ) ) as HTMLElement;
		// eslint-disable-next-line testing-library/no-test-id-queries
		const deleteIcon = within( helloChip ).getByTestId( 'CancelIcon' );
		fireEvent.click( deleteIcon );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( [ wrapQuery( 34, 'Sample Page' ) ] );
	} );

	it( 'excludes already-selected ids from the autocomplete options', () => {
		// Arrange.
		const value = [ wrapQuery( 12, 'Hello World' ) ];

		mockUseBoundProp.mockReturnValue( {
			value,
			setValue,
			disabled: false,
			propType,
			bind: 'selection',
			path: [],
			resetValue: jest.fn(),
			restoreValue: jest.fn(),
		} );

		// Act.
		renderControl( <QueryChipsControl queryOptions={ queryOptions } />, {
			setValue,
			value,
			bind: 'selection',
			propType,
		} );

		// Assert.
		expect( mockUseQueryAutocomplete ).toHaveBeenCalledWith( expect.objectContaining( { excludeIds: [ 12 ] } ) );
	} );
} );
