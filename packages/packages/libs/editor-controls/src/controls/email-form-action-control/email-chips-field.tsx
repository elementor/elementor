import * as React from 'react';
import { type KeyboardEvent, type SyntheticEvent, useState } from 'react';
import { stringArrayPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { Autocomplete, Grid, TextField } from '@elementor/ui';

import { useBoundProp } from '../../bound-prop-context';
import { ChipsList } from '../../components/chips-list';
import { ControlFormLabel } from '../../components/control-form-label';
import ControlActions from '../../control-actions/control-actions';
import { createControl } from '../../create-control';
import { CHIP_TRIGGER_KEYS, isValidEmail } from './utils';

type EmailChipsControlProps = {
	placeholder?: string;
};

export const EmailChipsControl = createControl( ( { placeholder }: EmailChipsControlProps ) => {
	const { value, setValue, disabled } = useBoundProp( stringArrayPropTypeUtil );
	const [ inputValue, setInputValue ] = useState( '' );

	const items = value || [];

	const selectedValues: string[] = items
		.map( ( item ) => stringPropTypeUtil.extract( item ) )
		.filter( ( val ): val is string => val !== null );

	const tryAddChip = ( raw: string ) => {
		const address = raw.trim();

		if ( ! address || selectedValues.includes( address ) || ! isValidEmail( address ) ) {
			return;
		}

		setValue( [ ...items, stringPropTypeUtil.create( address ) ] );
		setInputValue( '' );
	};

	const handleChange = ( _: SyntheticEvent, newValue: string[] ) => {
		const updated = [];

		for ( const entry of newValue ) {
			const address = entry.trim();

			if ( ! address || ! isValidEmail( address ) ) {
				continue;
			}

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
		<ControlActions>
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
				value={ selectedValues }
				onChange={ handleChange }
				options={ [] }
				onBlur={ handleBlur }
				getOptionLabel={ ( option ) => option }
				isOptionEqualToValue={ ( option, val ) => option === val }
				renderInput={ ( params ) => (
					<TextField { ...params } placeholder={ placeholder } onKeyDown={ handleKeyDown } />
				) }
				renderTags={ ( tagValues, getTagProps ) => (
					<ChipsList getLabel={ ( option ) => option } getTagProps={ getTagProps } values={ tagValues } />
				) }
			/>
		</ControlActions>
	);
} );

type EmailChipsFieldProps = {
	fieldLabel: string;
	placeholder?: string;
};

export const EmailChipsField = ( { fieldLabel, placeholder }: EmailChipsFieldProps ) => (
	<Grid container direction="column" gap={ 0.5 }>
		<Grid item>
			<ControlFormLabel>{ fieldLabel }</ControlFormLabel>
		</Grid>
		<Grid item>
			<EmailChipsControl placeholder={ placeholder } />
		</Grid>
	</Grid>
);
