import * as React from 'react';
import { type HTMLAttributes, useId, useMemo } from 'react';
import {
	Autocomplete,
	type AutocompleteProps,
	type AutocompleteRenderGroupParams,
	Box,
	Chip,
	styled,
	TextField,
	type Theme,
	Typography,
} from '@elementor/ui';

import { addGroupToOptions } from './autocomplete-option-internal-properties';
import { type CreatableAutocompleteProps, type InternalOption, type SafeOptionConstraint } from './types';
import { useAutocompleteChange } from './use-autocomplete-change';
import { useInputState, useOpenState } from './use-autocomplete-states';
import { useCreateOption } from './use-create-option';
import { useFilterOptions } from './use-filter-options';

const MIN_INPUT_LENGTH = 2;

export const CreatableAutocomplete = React.forwardRef( CreatableAutocompleteInner ) as <
	TOption extends SafeOptionConstraint,
>(
	props: CreatableAutocompleteProps< TOption > & {
		ref?: React.ForwardedRef< HTMLElement >;
	}
) => ReturnType< typeof CreatableAutocompleteInner >;

function CreatableAutocompleteInner< TOption extends SafeOptionConstraint >(
	{
		selected,
		options,
		entityName,
		onSelect,
		placeholder,
		onCreate,
		validate,
		renderEmptyState,
		...props
	}: CreatableAutocompleteProps< TOption >,
	ref: React.ForwardedRef< HTMLElement >
) {
	const { inputValue, setInputValue, error, setError, inputHandlers } = useInputState( validate );
	const { open, openDropdown, closeDropdown } = useOpenState( props.open );
	const { createOption, loading } = useCreateOption( { onCreate, validate, setInputValue, setError, closeDropdown } );

	const [ internalOptions, internalSelected ] = useMemo(
		() => [ options, selected ].map( ( optionsArr ) => addGroupToOptions( optionsArr, entityName?.plural ) ),
		[ options, selected, entityName?.plural ]
	);

	const handleChange = useAutocompleteChange( {
		options: internalOptions,
		onSelect,
		createOption,
		setInputValue,
		closeDropdown,
	} );

	const filterOptions = useFilterOptions( { options, selected, onCreate, entityName } );

	const isCreatable = Boolean( onCreate );

	const freeSolo = isCreatable || inputValue.length < MIN_INPUT_LENGTH || undefined;

	return (
		<Autocomplete< InternalOption< TOption >, true, true, true >
			renderTags={ ( tagValue, getTagProps ) => {
				return tagValue.map( ( option, index ) => (
					<Chip
						size="tiny"
						{ ...getTagProps( { index } ) }
						key={ option.key ?? option.value ?? option.label }
						label={ option.label }
					/>
				) );
			} }
			{ ...( props as AutocompleteProps< InternalOption< TOption >, true, true, true > ) }
			ref={ ref }
			freeSolo={ freeSolo }
			forcePopupIcon={ false }
			multiple
			clearOnBlur
			selectOnFocus
			disableClearable
			handleHomeEndKeys
			disabled={ loading }
			open={ open }
			onOpen={ openDropdown }
			onClose={ closeDropdown }
			disableCloseOnSelect
			value={ internalSelected }
			options={ internalOptions }
			ListboxComponent={
				error
					? React.forwardRef< HTMLElement, ErrorTextProps >( ( _, errorTextRef ) => (
							<ErrorText ref={ errorTextRef } error={ error } />
					  ) )
					: undefined
			}
			renderGroup={ ( params ) => <Group { ...params } /> }
			inputValue={ inputValue }
			renderInput={ ( params ) => {
				return (
					<TextField
						{ ...params }
						error={ Boolean( error ) }
						placeholder={ placeholder }
						{ ...inputHandlers }
						sx={ ( theme: Theme ) => ( {
							'.MuiAutocomplete-inputRoot.MuiInputBase-adornedStart': {
								paddingLeft: theme.spacing( 0.25 ),
								paddingRight: theme.spacing( 0.25 ),
							},
						} ) }
					/>
				);
			} }
			onChange={ handleChange }
			getOptionLabel={ ( option ) => ( typeof option === 'string' ? option : option.label ) }
			getOptionKey={ ( option ) => {
				if ( typeof option === 'string' ) {
					return option;
				}

				return option.key ?? option.value ?? option.label;
			} }
			filterOptions={ filterOptions }
			groupBy={ ( option ) => option._group ?? '' }
			renderOption={ ( optionProps, option ) => {
				const { _group, label } = option;

				return (
					<li
						{ ...optionProps }
						style={ { display: 'block', textOverflow: 'ellipsis' } }
						data-group={ _group }
					>
						{ label }
					</li>
				);
			} }
			noOptionsText={ renderEmptyState?.( {
				searchValue: inputValue,
				onClear: () => {
					setInputValue( '' );
					closeDropdown();
				},
			} ) }
			isOptionEqualToValue={ ( option, value ) => {
				if ( typeof option === 'string' ) {
					return option === value;
				}

				return option.value === value.value;
			} }
		/>
	);
}

const Group = ( params: Omit< AutocompleteRenderGroupParams, 'key' > ) => {
	const id = `combobox-group-${ useId().replace( /:/g, '_' ) }`;

	return (
		<StyledGroup role="group" aria-labelledby={ id }>
			<StyledGroupHeader id={ id }> { params.group }</StyledGroupHeader>
			<StyledGroupItems role="listbox">{ params.children }</StyledGroupItems>
		</StyledGroup>
	);
};

type ErrorTextProps = {
	error?: string;
} & HTMLAttributes< HTMLElement >;

const ErrorText = React.forwardRef< HTMLElement, ErrorTextProps >( ( { error = 'error' }, ref ) => {
	return (
		<Box
			ref={ ref }
			sx={ ( theme: Theme ) => ( {
				padding: theme.spacing( 2 ),
			} ) }
		>
			<Typography variant="caption" sx={ { color: 'error.main', display: 'inline-block' } }>
				{ error }
			</Typography>
		</Box>
	);
} );

const StyledGroup = styled( 'li' )`
	&:not( :last-of-type ) {
		border-bottom: 1px solid ${ ( { theme } ) => theme.palette.divider };
	}
`;

const StyledGroupHeader = styled( Box )( ( { theme } ) => ( {
	position: 'sticky',
	top: '-8px',
	padding: theme.spacing( 1, 2 ),
	color: theme.palette.text.tertiary,
	backgroundColor: theme.palette.primary.contrastText,
} ) );

const StyledGroupItems = styled( 'ul' )`
	padding: 0;
`;
