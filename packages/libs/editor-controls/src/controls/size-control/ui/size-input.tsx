import * as React from 'react';
import { forwardRef } from 'react';
import type { PropValue } from '@elementor/editor-props';
import type { TextFieldProps } from '@elementor/ui';

import { NumberInput } from '../../../components/number-input';

type Props = {
	type: 'number' | 'text';
	value: PropValue;
	placeholder?: string;
	focused?: boolean;
	disabled?: boolean;
	id?: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	InputProps: TextFieldProps['InputProps'] & {
		endAdornment: React.JSX.Element;
	};
	inputProps?: TextFieldProps['inputProps'];
};

export const SizeInput = forwardRef(
	(
		{
			id,
			type,
			value,
			onBlur,
			onKeyUp,
			focused,
			disabled,
			onChange,
			onKeyDown,
			InputProps,
			inputProps,
			placeholder,
		}: Props,
		ref
	) => {
		return (
			<NumberInput
				id={id}
				ref={ref}
				size="tiny"
				fullWidth
				type={type}
				value={value}
				placeholder={placeholder}
				onKeyUp={onKeyUp}
				focused={focused}
				disabled={disabled}
				onKeyDown={onKeyDown}
				onInput={onChange}
				onBlur={onBlur}
				InputProps={InputProps}
				inputProps={inputProps}
				sx={getCursorStyle(InputProps?.readOnly ?? false)}
			/>
		);
	}
);

const getCursorStyle = (readOnly: boolean) => ({
	input: { cursor: readOnly ? 'default !important' : undefined },
});
