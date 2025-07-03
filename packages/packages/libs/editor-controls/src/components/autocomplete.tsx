import * as React from 'react';
import { forwardRef } from 'react';
import { XIcon } from '@elementor/icons';
import {
	Autocomplete as AutocompleteBase,
	type AutocompleteRenderInputParams,
	Box,
	IconButton,
	InputAdornment,
	TextField,
} from '@elementor/ui';

export type FlatOption = {
	id: string;
	label: string;
	groupLabel?: never;
};

export type CategorizedOption = {
	id: string;
	label: string;
	groupLabel: string;
};

export type Props = {
	options: FlatOption[] | CategorizedOption[];
	value?: number | string | null;
	onOptionChange: ( newValue: number | null ) => void;
	onTextChange?: ( newValue: string | null ) => void;
	allowCustomValues?: boolean;
	placeholder?: string;
	minInputLength?: number;
};

export const Autocomplete = forwardRef( ( props: Props, ref ) => {
	const {
		options,
		onOptionChange,
		onTextChange,
		allowCustomValues = false,
		placeholder = '',
		minInputLength = 2,
		value = '',
		...restProps
	} = props;

	const optionKeys = _factoryFilter( value, options, minInputLength ).map( ( { id } ) => id );
	const allowClear = !! value;

	// Prevents MUI warning when freeSolo/allowCustomValues is false
	const muiWarningPreventer = allowCustomValues || !! value?.toString()?.length;

	const isOptionEqualToValue = muiWarningPreventer ? undefined : () => true;

	const isValueFromOptions = typeof value === 'number' && !! findMatchingOption( options, value );

	return (
		<AutocompleteBase
			{ ...restProps }
			ref={ ref }
			forcePopupIcon={ false }
			disableClearable={ true } // Disabled component's auto clear icon to use our custom one instead
			freeSolo={ allowCustomValues }
			value={ value?.toString() || '' }
			size={ 'tiny' }
			onChange={ ( _, newValue ) => onOptionChange( Number( newValue ) ) }
			readOnly={ isValueFromOptions }
			options={ optionKeys }
			getOptionKey={ ( optionId ) => findMatchingOption( options, optionId )?.id || optionId }
			getOptionLabel={ ( optionId ) => findMatchingOption( options, optionId )?.label || optionId.toString() }
			groupBy={
				isCategorizedOptionPool( options )
					? ( optionId: string ) => findMatchingOption( options, optionId )?.groupLabel || optionId
					: undefined
			}
			isOptionEqualToValue={ isOptionEqualToValue }
			filterOptions={ () => optionKeys }
			renderOption={ ( optionProps, optionId ) => (
				<Box component="li" { ...optionProps } key={ optionProps.id }>
					{ findMatchingOption( options, optionId )?.label ?? optionId }
				</Box>
			) }
			renderInput={ ( params ) => (
				<TextInput
					params={ params }
					handleChange={ ( newValue ) => onTextChange?.( newValue ) }
					allowClear={ allowClear }
					placeholder={ placeholder }
					hasSelectedValue={ isValueFromOptions }
				/>
			) }
		/>
	);
} );

const TextInput = ( {
	params,
	allowClear,
	placeholder,
	handleChange,
	hasSelectedValue,
}: {
	params: AutocompleteRenderInputParams;
	allowClear: boolean;
	handleChange: ( newValue: string | null ) => void;
	placeholder: string;
	hasSelectedValue: boolean;
} ) => {
	const onChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		handleChange( event.target.value );
	};

	return (
		<TextField
			{ ...params }
			placeholder={ placeholder }
			onChange={ onChange }
			sx={ {
				'& .MuiInputBase-input': {
					cursor: hasSelectedValue ? 'default' : undefined,
				},
			} }
			InputProps={ {
				...params.InputProps,
				endAdornment: <ClearButton params={ params } allowClear={ allowClear } handleChange={ handleChange } />,
			} }
		/>
	);
};

const ClearButton = ( {
	allowClear,
	handleChange,
	params,
}: {
	params: AutocompleteRenderInputParams;
	allowClear: boolean;
	handleChange: ( newValue: string | null ) => void;
} ) => (
	<InputAdornment position="end">
		{ allowClear && (
			<IconButton size={ params.size } onClick={ () => handleChange( null ) } sx={ { cursor: 'pointer' } }>
				<XIcon fontSize={ params.size } />
			</IconButton>
		) }
	</InputAdornment>
);

export function findMatchingOption(
	options: FlatOption[] | CategorizedOption[],
	optionId: string | number | null = null
) {
	const formattedOption = ( optionId || '' ).toString();

	return options.find( ( { id } ) => formattedOption === id.toString() );
}

export function isCategorizedOptionPool( options: FlatOption[] | CategorizedOption[] ): options is CategorizedOption[] {
	return options.every( ( option ) => 'groupLabel' in option );
}
function _factoryFilter< T extends FlatOption[] | CategorizedOption[] >(
	newValue: string | number | null,
	options: T,
	minInputLength: number
): T {
	if ( null === newValue ) {
		return options;
	}

	const formattedValue = String( newValue || '' )?.toLowerCase();

	if ( formattedValue.length < minInputLength ) {
		return new Array( 0 ) as T;
	}

	return options.filter(
		( option ) =>
			String( option.id ).toLowerCase().includes( formattedValue ) ||
			option.label.toLowerCase().includes( formattedValue )
	) as T;
}
