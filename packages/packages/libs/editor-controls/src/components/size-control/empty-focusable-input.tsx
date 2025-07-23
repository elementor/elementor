import * as React from 'react';
import { forwardRef } from 'react';
import { TextField, type TextFieldProps } from '@elementor/ui';

type EmptyFocusableInputProps = {
	placeholder?: string;
	disabled?: boolean;
	onFocus?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onClick?: ( event: React.MouseEvent< HTMLInputElement > ) => void;
	InputProps?: TextFieldProps[ 'InputProps' ];
	isPopoverOpen?: boolean;
	value?: string | number;
};

export const EmptyFocusableInput = forwardRef< HTMLInputElement, EmptyFocusableInputProps >(
	( { placeholder, disabled, onFocus, onBlur, onClick, InputProps, isPopoverOpen = false, value = '' }, ref ) => {
		return (
			<TextField
				ref={ ref }
				sx={ {
					input: {
						cursor: 'default',
						caretColor: 'transparent', // Hide typing cursor
					},
					// Custom focus border - show when focused OR when popover is open
					'& .MuiOutlinedInput-root': {
						'&.Mui-focused fieldset': {
							borderColor: 'primary.main',
							borderWidth: '2px',
						},
						// Force focus styling when popover is open
						...( isPopoverOpen && {
							'& fieldset': {
								borderColor: 'primary.main !important',
								borderWidth: '2px !important',
							},
						} ),
					},
				} }
				size="tiny"
				fullWidth
				value={ value } // Show the custom value
				readOnly // Prevent typing
				autoComplete="off" // Prevent auto-complete suggestions
				disabled={ disabled }
				onFocus={ onFocus }
				onBlur={ onBlur }
				onClick={ onClick }
				placeholder={ placeholder }
				InputProps={ InputProps }
			/>
		);
	}
);

EmptyFocusableInput.displayName = 'EmptyFocusableInput';
