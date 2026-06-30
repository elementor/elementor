import * as React from 'react';
import { forwardRef } from 'react';
import type { PropValue } from '@elementor/editor-props';
import type { TextFieldProps } from '@elementor/ui';

import { NumberInput } from '../number-input';

type Props = {
	type: 'number' | 'text';
	value: PropValue;
	focused?: boolean;
	disabled?: boolean;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	onKeyUp?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	InputProps: TextFieldProps[ 'InputProps' ] & {
		endAdornment: React.JSX.Element;
	};
};

export const UnstableSizeInput = forwardRef(
	( { type, value, onChange, onKeyDown, onKeyUp, InputProps, onBlur, focused, disabled }: Props, ref ) => {
		return (
			<NumberInput
				ref={ ref }
				size="tiny"
				fullWidth
				type={ type }
				value={ value }
				onKeyUp={ onKeyUp }
				focused={ focused }
				disabled={ disabled }
				onKeyDown={ onKeyDown }
				onInput={ onChange }
				onBlur={ onBlur }
				InputProps={ InputProps }
				sx={ getCursorStyle( InputProps?.readOnly ?? false ) }
			/>
		);
	}
);

const getCursorStyle = ( readOnly: boolean ) => ( {
	input: { cursor: readOnly ? 'default !important' : undefined },
} );
