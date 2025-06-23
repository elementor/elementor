import * as React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { CreatableAutocomplete } from '../creatable-autocomplete';

const options = [
	{ label: 'Option 1', value: '1' },
	{ label: 'Option 2', value: '2' },
	{ label: 'Option 3', value: '3' },
];

const entityName = {
	singular: 'test option',
	plural: 'test options',
};

const placeholder = 'Type to search/add test option';

const mockValidateAlwaysError = jest.fn().mockReturnValue( {
	isValid: false,
	errorMessage: 'Option name is invalid',
} );

describe( 'CreatableAutocomplete', () => {
	const setup = ( props = {} ) => {
		const onSelect = jest.fn();
		const onCreate = jest.fn();

		render(
			<CreatableAutocomplete
				selected={ [] }
				options={ options }
				onSelect={ onSelect }
				onCreate={ onCreate }
				open
				{ ...props }
			/>
		);

		return { onSelect, onCreate };
	};

	it( 'should render options properly, before and after filter', async () => {
		// Arrange
		setup( { selected: [ { label: 'Option 2', value: '2' } ], placeholder, entityName } );

		// Assert
		const dropdown = screen.getAllByRole( 'listbox' )[ 0 ];
		expect( dropdown ).toBeInTheDocument();

		// Selected options should not be displayed in the dropdown, but as chips above
		expect( screen.getByText( 'Option 2' ) ).toBeInTheDocument();
		expect( within( dropdown ).queryByText( 'Option 2' ) ).not.toBeInTheDocument();

		// The dropdown should display all available options
		expect( within( dropdown ).getByRole( 'option', { name: 'Option 1' } ) ).toBeInTheDocument();
		expect( within( dropdown ).getByRole( 'option', { name: 'Option 3' } ) ).toBeInTheDocument();

		// Act
		const input = screen.getByPlaceholderText( 'Type to search/add test option' );
		fireEvent.change( input, { target: { value: 'Option 1' } } );

		// Assert
		// The dropdown should filter options based on user input
		expect( within( dropdown ).getByRole( 'option', { name: 'Option 1' } ) ).toBeInTheDocument();
		expect( within( dropdown ).queryByText( 'Option 3' ) ).not.toBeInTheDocument();
	} );

	it( 'should show create option button when user typing', async () => {
		// Arrange.
		setup( { entityName } );
		const dropdown = screen.getAllByRole( 'listbox' )[ 0 ];

		// Assert.
		// Create options section should not be displayed before typing
		expect( screen.queryByText( 'Create a new test option' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Create', { exact: false } ) ).not.toBeInTheDocument();

		// Act.
		const input = screen.getByRole( 'combobox' );
		fireEvent.change( input, { target: { value: 'New Option' } } );

		// Assert.
		expect( within( dropdown ).getByText( 'Create a new test option' ) ).toBeInTheDocument();
		expect( within( dropdown ).getByText( 'Create "New Option"' ) ).toBeInTheDocument();
	} );

	it( 'should call onSelect when an existing option is selected', async () => {
		// Arrange.
		const { onSelect } = setup( { selected: [ { label: 'Option 1', value: '1' } ] } );

		// Act.
		const input = screen.getByRole( 'combobox' );
		fireEvent.change( input, { target: { value: 'Option 2' } } );
		fireEvent.keyDown( input, { key: 'Enter' } );

		// Assert.
		expect( onSelect ).toHaveBeenCalledTimes( 1 );
		expect( onSelect ).toHaveBeenCalledWith(
			[
				{ label: 'Option 1', value: '1' },
				{ label: 'Option 2', value: '2' },
			],
			'selectOption',
			{ label: 'Option 2', value: '2' }
		);
	} );

	it( 'should call onCreate when a new option is created', async () => {
		// Arrange.
		const { onCreate } = setup( { selected: [ { label: 'Option 1', value: '1' } ] } );

		// Act.
		const input = screen.getByRole( 'combobox' );
		fireEvent.change( input, { target: { value: 'New Option' } } );
		fireEvent.keyDown( input, { key: 'Enter' } );

		// Assert.
		await waitFor( () => {
			expect( onCreate ).toHaveBeenCalledTimes( 1 );
		} );
		expect( onCreate ).toHaveBeenCalledWith( 'New Option' );
	} );

	it( 'should show error message when validation fails', async () => {
		// Arrange.
		setup( { validate: mockValidateAlwaysError } );

		// Act.
		const input = screen.getByRole( 'combobox' );
		fireEvent.change( input, { target: { value: 'Invalid Option' } } );

		// Assert.
		expect( mockValidateAlwaysError ).toHaveBeenCalledWith( 'Invalid Option', 'inputChange' );
		expect( screen.getByText( 'Option name is invalid' ) ).toBeInTheDocument();
	} );

	it( 'should not display create option button when validation fails', async () => {
		// Arrange.
		setup( { validate: mockValidateAlwaysError, entityName } );

		// Act.
		const input = screen.getByRole( 'combobox' );
		fireEvent.change( input, { target: { value: 'Invalid Option' } } );

		// Assert.
		expect( screen.queryByText( 'Create "Invalid Option"' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Create a new test option' ) ).not.toBeInTheDocument();
	} );

	it( 'should not call onCreate when validation fails', async () => {
		// Arrange.
		const { onCreate } = setup( { validate: mockValidateAlwaysError } );

		// Act.
		const input = screen.getByRole( 'combobox' );
		fireEvent.change( input, { target: { value: 'Invalid Option' } } );
		fireEvent.keyDown( input, { key: 'Enter' } );

		// Assert.
		expect( mockValidateAlwaysError ).toHaveBeenCalledWith( 'Invalid Option', 'create' );
		expect( onCreate ).not.toHaveBeenCalled();
	} );
} );
