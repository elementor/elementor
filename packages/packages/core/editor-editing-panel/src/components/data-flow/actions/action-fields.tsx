import * as React from 'react';
import { useState } from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent, Stack, Switch, TextField, Typography } from '@elementor/ui';

type Option = { value: string; label: string };

const LABEL_WIDTH = '40%';

export const FieldRow = ( { label, children }: { label: string; children: React.ReactNode } ) => (
	<Stack direction="row" alignItems="center" gap={ 1 }>
		<Typography variant="caption" color="text.secondary" sx={ { width: LABEL_WIDTH, flexShrink: 0 } }>
			{ label }
		</Typography>
		{ children }
	</Stack>
);

type SelectFieldProps = {
	label: string;
	value: string;
	options: Option[];
	onChange: ( value: string ) => void;
};

export const SelectField = ( { label, value, options, onChange }: SelectFieldProps ) => (
	<FieldRow label={ label }>
		<Select
			size="tiny"
			fullWidth
			value={ value }
			inputProps={ { 'aria-label': label } }
			onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
		>
			{ options.map( ( option ) => (
				<MenuListItem key={ option.value } value={ option.value }>
					{ option.label }
				</MenuListItem>
			) ) }
		</Select>
	</FieldRow>
);

type TextInputProps< T > = {
	label: string;
	value: T | undefined;
	placeholder?: string;
	format?: ( value: T | undefined ) => string;
	parse: ( input: string ) => T | undefined;
	onChange: ( value: T | undefined ) => void;
	hideLabel?: boolean;
};

const defaultFormat = ( value: unknown ) => ( value === undefined ? '' : String( value ) );

export function TextInput< T >( {
	label,
	value,
	placeholder,
	format = defaultFormat,
	parse,
	onChange,
	hideLabel,
}: TextInputProps< T > ) {
	const [ input, setInput ] = useState( () => format( value ) );

	const field = (
		<TextField
			size="tiny"
			fullWidth
			value={ input }
			placeholder={ placeholder }
			inputProps={ { 'aria-label': label, spellCheck: false } }
			onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => {
				setInput( event.target.value );
				onChange( parse( event.target.value ) );
			} }
		/>
	);

	return hideLabel ? field : <FieldRow label={ label }>{ field }</FieldRow>;
}

export const parseText = ( input: string ) => ( input === '' ? undefined : input );

export const parseNumber = ( input: string ) => {
	const number = Number( input );

	return input.trim() === '' || ! Number.isFinite( number ) ? undefined : number;
};

export const SwitchField = ( {
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: ( checked: boolean ) => void;
} ) => (
	<FieldRow label={ label }>
		<Switch
			size="small"
			checked={ checked }
			inputProps={ { 'aria-label': label } }
			onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => onChange( event.target.checked ) }
		/>
	</FieldRow>
);

export const toOptions = ( values: readonly string[] ): Option[] =>
	values.map( ( value ) => ( { value, label: value } ) );
