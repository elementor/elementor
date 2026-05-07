import * as React from 'react';
import { type KeyboardEvent, type SyntheticEvent, useState } from 'react';
import { stringArrayPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { Autocomplete, Grid, TextField } from '@elementor/ui';

import { useBoundProp } from '../../bound-prop-context';
import { ChipsList } from '../../components/chips-list';
import { ControlFormLabel } from '../../components/control-form-label';
import { CHIP_TRIGGER_KEYS, isBrowserEmailValid } from './utils';

type EmailChip = { label: string; value: string };

type EmailChipsFieldProps = {
	fieldLabel: string;
	placeholder?: string;
};

export const EmailChipsField = ( { fieldLabel, placeholder }: EmailChipsFieldProps ) => {
	const { value, setValue, disabled } = useBoundProp( stringArrayPropTypeUtil );
	const [ inputValue, setInputValue ] = useState( '' );

	const items = value || [];

	const selectedValues: string[] = items
		.map( ( item ) => stringPropTypeUtil.extract( item ) )
		.filter( ( val ): val is string => val !== null );

	const selectedChips: EmailChip[] = selectedValues.map( ( addr ) => ( { label: addr, value: addr } ) );

	const tryAddChip = ( raw: string ) => {
		const address = raw.trim();

		if ( ! address || selectedValues.includes( address ) || ! isBrowserEmailValid( address ) ) {
			return;
		}

		setValue( [ ...items, stringPropTypeUtil.create( address ) ] );
		setInputValue( '' );
	};

	const handleChange = ( _: SyntheticEvent, newValue: ( EmailChip | string )[] ) => {
		const unique = new Set< string >();
		const updated = [];

		for ( const entry of newValue ) {
			const address = ( typeof entry === 'string' ? entry : entry.value ).trim();

			if ( ! address || unique.has( address ) ) {
				continue;
			}

			const isExisting = selectedValues.includes( address );

			if ( ! isExisting && ! isBrowserEmailValid( address ) ) {
				continue;
			}

			unique.add( address );
			updated.push( stringPropTypeUtil.create( address ) );
		}

		setValue( updated );
		setInputValue( '' );
	};

	const handleBlur = ( event: SyntheticEvent ) => {
		const target = event.target as HTMLInputElement;

		tryAddChip( target.value );
		setInputValue( '' );
	};

	const handleKeyDown = ( event: KeyboardEvent< HTMLDivElement > ) => {
		if ( CHIP_TRIGGER_KEYS.has( event.key ) && inputValue.trim() ) {
			event.preventDefault();
			tryAddChip( inputValue );
		}
	};

	return (
		<Grid container direction="column" gap={ 0.5 }>
			<Grid item>
				<ControlFormLabel>{ fieldLabel }</ControlFormLabel>
			</Grid>
			<Grid item>
				<Autocomplete
					fullWidth
					multiple
					freeSolo
					size="tiny"
					disabled={ disabled }
					inputValue={ inputValue }
					onInputChange={ ( _, val, reason ) => {
						if ( reason !== 'reset' ) {
							setInputValue( val );
						}
					} }
					value={ selectedChips }
					onChange={ handleChange }
					options={ [] as EmailChip[] }
					onBlur={ handleBlur }
					getOptionLabel={ ( option ) => ( typeof option === 'string' ? option : option.label ) }
					isOptionEqualToValue={ ( option, val ) => option.value === val.value }
					renderInput={ ( params ) => (
						<TextField { ...params } placeholder={ placeholder } onKeyDown={ handleKeyDown } />
					) }
					renderTags={ ( tagValues, getTagProps ) => (
						<ChipsList
							getLabel={ ( option ) => ( typeof option === 'string' ? option : option.label ) }
							getTagProps={ getTagProps }
							values={ tagValues }
						/>
					) }
				/>
			</Grid>
		</Grid>
	);
};
