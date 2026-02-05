import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen, within } from '@testing-library/react';

import * as boundPropContext from '../../bound-prop-context';
import { ChipsControl } from '../chips-control';

const propType = createMockPropType( { kind: 'array' } );
const setValue = jest.fn();

jest.mock( '../../bound-prop-context', () => ( {
	...jest.requireActual( '../../bound-prop-context' ),
	useBoundProp: jest.fn(),
} ) );

const mockUseBoundProp = boundPropContext.useBoundProp as jest.MockedFunction< typeof boundPropContext.useBoundProp >;

describe( 'ChipsControl', () => {
	beforeEach( () => {
		setValue.mockClear();
		mockUseBoundProp.mockReturnValue( {
			value: [],
			setValue,
			disabled: false,
			propType,
			bind: 'classes',
			path: [],
			resetValue: jest.fn(),
			restoreValue: jest.fn(),
		} );
	} );

	const defaultOptions = [
		{ label: 'Collect submissions', value: 'collect-submissions' },
		{ label: 'Email', value: 'email' },
		{ label: 'Webhook', value: 'webhook' },
	];

	it( 'should render empty state with no selected chips', () => {
		// Arrange
		const props = {
			setValue,
			value: [],
			bind: 'classes',
			propType,
		};

		// Act
		renderControl( <ChipsControl options={ defaultOptions } />, props );

		// Assert
		const input = screen.getByRole( 'combobox' );
		expect( input ).toBeInTheDocument();
	} );

	it( 'should add a chip when selecting an option', () => {
		// Arrange
		const props = {
			setValue,
			value: [],
			bind: 'classes',
			propType,
		};

		// Act
		renderControl( <ChipsControl options={ defaultOptions } />, props );

		const input = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( input );

		const listbox = screen.getByRole( 'listbox' );
		const emailOption = within( listbox ).getByText( 'Email' );
		fireEvent.click( emailOption );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( [ 'email' ] );
	} );

	it( 'should handle empty options array', () => {
		// Arrange
		const props = {
			setValue,
			value: [],
			bind: 'classes',
			propType,
		};

		// Act
		renderControl( <ChipsControl options={ [] } />, props );

		const input = screen.getByRole( 'combobox' );

		// Assert
		expect( input ).toBeInTheDocument();
	} );

	it( 'should handle value as null', () => {
		// Arrange
		const props = {
			setValue,
			value: null,
			bind: 'classes',
			propType,
		};

		// Act
		renderControl( <ChipsControl options={ defaultOptions } />, props );

		const input = screen.getByRole( 'combobox' );

		// Assert
		expect( input ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Email/i } ) ).not.toBeInTheDocument();
	} );

	it( 'should remove a chip when clicking delete button', () => {
		// Arrange
		mockUseBoundProp.mockReturnValue( {
			value: [ 'email', 'webhook' ],
			setValue,
			disabled: false,
			propType,
			bind: 'classes',
			path: [],
			resetValue: jest.fn(),
			restoreValue: jest.fn(),
		} );

		const props = {
			setValue,
			value: [ 'email', 'webhook' ],
			bind: 'classes',
			propType,
		};

		// Act
		renderControl( <ChipsControl options={ defaultOptions } />, props );

		const chips = screen.getAllByRole( 'button' );
		const emailChip = chips.find( ( chip ) => chip.textContent?.includes( 'Email' ) ) as HTMLElement;
		// eslint-disable-next-line testing-library/no-node-access
		const deleteIcon = emailChip.querySelector( '.MuiChip-deleteIcon' ) as HTMLElement;
		fireEvent.click( deleteIcon );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( [ 'webhook' ] );
	} );

	it( 'should set null when removing the last chip', () => {
		// Arrange
		mockUseBoundProp.mockReturnValue( {
			value: [ 'email' ],
			setValue,
			disabled: false,
			propType,
			bind: 'classes',
			path: [],
			resetValue: jest.fn(),
			restoreValue: jest.fn(),
		} );

		const props = {
			setValue,
			value: [ 'email' ],
			bind: 'classes',
			propType,
		};

		// Act
		renderControl( <ChipsControl options={ defaultOptions } />, props );

		const chips = screen.getAllByRole( 'button' );
		const emailChip = chips.find( ( chip ) => chip.textContent?.includes( 'Email' ) ) as HTMLElement;
		// eslint-disable-next-line testing-library/no-node-access
		const deleteIcon = emailChip.querySelector( '.MuiChip-deleteIcon' ) as HTMLElement;
		fireEvent.click( deleteIcon );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( null );
	} );
} );
