import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ERROR_MESSAGES } from '../../../utils/validations';
import { LabelField, type LabelFieldProps } from '../../fields/label-field';
import { VariableEditableCell } from '../variable-editable-cell';

describe( 'VariableEditableCell Error Display', () => {
	const mockOnChange = jest.fn();

	const createLabelFieldElement =
		() =>
		( { value, onChange, onErrorChange, error }: LabelFieldProps ) => (
			<LabelField
				value={ value || '' }
				onChange={ onChange }
				onErrorChange={ onErrorChange }
				error={ error }
				showWarningInfotip={ true }
			/>
		);

	const renderVariableEditableCell = ( props = {} ) => {
		const defaultProps = {
			initialValue: 'initial-value',
			onChange: mockOnChange,
			editableElement: createLabelFieldElement(),
			fieldType: 'label' as const,
			autoEdit: true,
		};

		return render(
			<VariableEditableCell { ...defaultProps } { ...props }>
				<span>Display Content</span>
			</VariableEditableCell>
		);
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Error Display', () => {
		it.each( [
			{
				reason: 'variable name is missing',
				value: '',
				message: ERROR_MESSAGES.MISSING_VARIABLE_NAME,
			},
			{
				reason: 'variable name contains invalid characters',
				value: 'invalid@name',
				message: ERROR_MESSAGES.INVALID_CHARACTERS,
			},
			{
				reason: 'variable name has no non-special characters',
				value: '---',
				message: ERROR_MESSAGES.NO_NON_SPECIAL_CHARACTER,
			},
			{
				reason: 'variable name exceeds maximum length',
				value: 'a'.repeat( 51 ),
				message: ERROR_MESSAGES.VARIABLE_LABEL_MAX_LENGTH,
			},
		] )( 'should display error message when $reason', ( { value, message } ) => {
			// Arrange
			renderVariableEditableCell();

			//Act
			const input = screen.getByRole( 'textbox' );
			fireEvent.change( input, { target: { value } } );
			fireEvent.blur( input );

			// Assert
			expect( screen.getByText( message ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Validation Triggering', () => {
		it.each( [
			{
				reason: 'variable name becomes empty',
				userInput: '',
				message: 'Give your variable a name.',
			},
			{
				reason: 'variable name contains invalid characters',
				userInput: 'test@invalid',
				message: 'Use letters, numbers, dashes (-), or underscores (_) for the name.',
			},
			{
				reason: 'variable name exceeds maximum length',
				userInput: 'a'.repeat( 51 ),
				message: 'Keep names up to 50 characters.',
			},
		] )( 'should trigger validation when $reason', ( { userInput, message } ) => {
			// Arrange
			renderVariableEditableCell();

			// Act
			const input = screen.getByRole( 'textbox' );
			fireEvent.change( input, { target: { value: userInput } } );

			// Assert
			expect( screen.getByText( message ) ).toBeInTheDocument();
		} );

		it( 'should clear error when validation passes', () => {
			// Arrange
			const errorMessage = ERROR_MESSAGES.INVALID_CHARACTERS;
			renderVariableEditableCell();

			//Act
			const input = screen.getByRole( 'textbox' );
			fireEvent.change( input, { target: { value: 'invalid@' } } );

			expect( screen.getByText( errorMessage ) ).toBeInTheDocument();

			fireEvent.change( input, { target: { value: 'valid-name' } } );

			// Assert
			expect( screen.queryByText( errorMessage ) ).not.toBeInTheDocument();
		} );
	} );
} );
