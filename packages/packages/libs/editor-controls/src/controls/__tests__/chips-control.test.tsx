import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen, within } from '@testing-library/react';

import { ChipsControl } from '../chips-control';

const propType = createMockPropType( { kind: 'plain' } );
const setValue = jest.fn();

describe( 'ChipsControl', () => {
	beforeEach( () => {
		setValue.mockClear();
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
			bind: 'actions-after-submit',
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
			bind: 'actions-after-submit',
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
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'classes', value: [ 'email' ] } );
	} );

	it( 'should handle empty options array', () => {
		// Arrange
		const props = {
			setValue,
			value: [],
			bind: 'actions-after-submit',
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
			bind: 'actions-after-submit',
			propType,
		};

		// Act
		renderControl( <ChipsControl options={ defaultOptions } />, props );

		const input = screen.getByRole( 'combobox' );

		// Assert
		expect( input ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Email/i } ) ).not.toBeInTheDocument();
	} );
} );
