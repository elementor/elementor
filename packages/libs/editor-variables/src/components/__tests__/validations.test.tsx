import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { colorPropTypeUtil } from '@elementor/editor-props';
import { TextIcon } from '@elementor/icons';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { VariableTypeProvider } from '../../context/variable-type-context';
import * as useInitialValueModule from '../../hooks/use-initial-value';
import * as usePropVariablesModule from '../../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { getVariableType } from '../../variables-registry/variable-type-registry';
import { ColorField } from '../fields/color-field';
import { VariableCreation } from '../variable-creation';

jest.mock( '../../hooks/use-prop-variables', () => ( {
	createVariable: jest.fn(),
} ) );

jest.mock( '../../hooks/use-initial-value', () => ( {
	useInitialValue: jest.fn(),
} ) );

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	useBoundProp: jest.fn(),
} ) );

jest.mock( '../../context/variable-selection-popover.context', () => ( {
	usePopoverContentRef: jest.fn( () => document.createElement( 'div' ) ),
} ) );

jest.mock( '../../variables-registry/variable-type-registry', () => ( {
	getVariableType: jest.fn(),
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackVariableEvent: jest.fn(),
} ) );

const mockOnClose = jest.fn();
const mockSetVariable = jest.fn();
const mockCreateVariable = jest.fn();
const mockGetVariableType = jest.mocked( getVariableType );
const mockUseInitialValue = jest.fn();

const baseProps = {
	onClose: mockOnClose,
};

afterEach( () => {
	jest.resetAllMocks();
} );

beforeEach( () => {
	jest.mocked( usePropVariablesModule.createVariable ).mockImplementation( mockCreateVariable );
	jest.mocked( useInitialValueModule.useInitialValue ).mockImplementation( mockUseInitialValue );

	jest.mocked( require( '@elementor/editor-controls' ).useBoundProp ).mockReturnValue( {
		setValue: mockSetVariable,
		path: [ 'settings', 'color' ],
	} );

	mockUseInitialValue.mockReturnValue( '' );

	mockGetVariableType.mockReturnValue( {
		icon: TextIcon,
		valueField: ColorField,
		variableType: 'color',
		propTypeUtil: colorVariablePropTypeUtil,
		fallbackPropTypeUtil: colorPropTypeUtil,
	} );
} );

const renderComponent = ( props = { propTypeKey: colorVariablePropTypeUtil.key } ) => {
	return renderWithTheme(
		<VariableTypeProvider propTypeKey={ props.propTypeKey }>
			<VariableCreation { ...baseProps } { ...props } />
		</VariableTypeProvider>
	);
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

it( 'should prevent form submission when validation fails', async () => {
	// Arrange
	mockCreateVariable.mockResolvedValue( 'variable-key-123' );
	renderComponent();

	const nameInput = screen.getAllByRole( 'textbox' )[ 0 ];
	const valueInput = screen.getAllByRole( 'textbox' )[ 1 ];

	// Act.
	fireEvent.change( nameInput, { target: { value: 'valid-name' } } );
	fireEvent.change( valueInput, { target: { value: '#ff0000' } } ); // Valid first
	fireEvent.change( valueInput, { target: { value: '' } } ); // Then invalid

	// Assert.
	await waitFor( () => {
		// eslint-disable-next-line testing-library/no-node-access
		const colorFieldContainer = screen.getByDisplayValue( '' ).closest( '[class*="MuiColorField"]' );

		expect( colorFieldContainer ).toHaveAttribute( 'error', 'Add a value to complete your variable.' );
	} );
} );
