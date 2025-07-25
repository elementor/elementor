import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { ColorVariableCreation } from '../color-variable-creation';

jest.mock( '../../hooks/use-prop-variables', () => ( {
	createVariable: jest.fn(),
} ) );

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	useBoundProp: jest.fn(),
} ) );

jest.mock( '../variable-selection-popover.context', () => ( {
	usePopoverContentRef: jest.fn( () => document.createElement( 'div' ) ),
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackVariableEvent: jest.fn(),
} ) );

const mockOnClose = jest.fn();
const mockSetVariable = jest.fn();
const mockCreateVariable = jest.fn();

const baseProps = {
	onClose: mockOnClose,
};

afterEach( () => {
	jest.resetAllMocks();
} );

beforeEach( () => {
	jest.mocked( usePropVariablesModule.createVariable ).mockImplementation( mockCreateVariable );
	jest.mocked( require( '@elementor/editor-controls' ).useBoundProp ).mockReturnValue( {
		setValue: mockSetVariable,
		path: [ 'settings', 'color' ],
	} );
} );

const renderComponent = ( props = {} ) => {
	return renderWithTheme( <ColorVariableCreation { ...baseProps } { ...props } /> );
};

it( 'should successfully change name with valid input', async () => {
	// Arrange.
	mockCreateVariable.mockResolvedValue( 'variable-key-123' );
	renderComponent();
	const nameInput = screen.getAllByRole( 'textbox' )[ 0 ];
	const valueInput = screen.getAllByRole( 'textbox' )[ 1 ];

	// Act.
	fireEvent.change( nameInput, { target: { value: 'valid-name' } } );
	fireEvent.change( valueInput, { target: { value: '#ff0000' } } );

	await waitFor( () => {
		const createButton = screen.getByRole( 'button', { name: 'Create' } );
		expect( createButton ).toBeEnabled();
	} );

	const createButton = screen.getByRole( 'button', { name: 'Create' } );
	fireEvent.click( createButton );

	// Assert.
	await waitFor( () => {
		expect( mockCreateVariable ).toHaveBeenCalledWith( {
			value: '#ff0000',
			label: 'valid-name',
			type: 'global-color-variable',
		} );
	} );
} );

it( 'should show error message when name validation fails', async () => {
	// Arrange.
	renderComponent();
	const nameInput = screen.getAllByRole( 'textbox' )[ 0 ];

	// Act.
	fireEvent.change( nameInput, { target: { value: 'invalid@name' } } );

	// Assert.
	const error = await screen.findByText( 'Use letters, numbers, dashes (-), or underscores (_) for the name.' );
	expect( error ).toBeInTheDocument();
} );

it( 'should disable create button when name validation fails', () => {
	// Arrange.
	renderComponent();
	const nameInput = screen.getAllByRole( 'textbox' )[ 0 ];
	const valueInput = screen.getAllByRole( 'textbox' )[ 1 ];

	// Act.
	fireEvent.change( nameInput, { target: { value: 'invalid@name' } } );
	fireEvent.change( valueInput, { target: { value: '#ff0000' } } );

	// Assert.
	const createButton = screen.getByRole( 'button', { name: 'Create' } );
	expect( createButton ).toBeDisabled();
} );

it( 'should disable create button when value validation fails', () => {
	// Arrange.
	renderComponent();
	const nameInput = screen.getAllByRole( 'textbox' )[ 0 ];
	const valueInput = screen.getAllByRole( 'textbox' )[ 1 ];

	// Act.
	fireEvent.change( nameInput, { target: { value: 'valid-name' } } );
	fireEvent.change( valueInput, { target: { value: '' } } );

	// Assert.
	const createButton = screen.getByRole( 'button', { name: 'Create' } );
	expect( createButton ).toBeDisabled();
} );
