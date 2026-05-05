import * as React from 'react';
import { type SyntheticEvent } from 'react';
import { stringArrayPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { Autocomplete, TextField } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { MultiselectAutocompleteChipTags } from '../components/multiselect-autocomplete-chip-tags';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export type ChipsOption = {
	label: string;
	value: string;
};

type ChipsControlProps = {
	options: ChipsOption[];
};

const SIZE = 'tiny';

export const ChipsControl = createControl( ( { options }: ChipsControlProps ) => {
	const { value, setValue, disabled } = useBoundProp( stringArrayPropTypeUtil );

	const selectedValues: string[] = ( value || [] )
		.map( ( item ) => stringPropTypeUtil.extract( item ) )
		.filter( ( val ): val is string => val !== null );

	const selectedOptions = selectedValues
		.map( ( val ) => options.find( ( opt ) => opt.value === val ) )
		.filter( ( opt ): opt is ChipsOption => opt !== undefined );

	const handleChange = ( _: SyntheticEvent, newValue: ChipsOption[] ) => {
		const values = newValue.map( ( option ) => stringPropTypeUtil.create( option.value ) );
		setValue( values );
	};

	return (
		<ControlActions>
			<Autocomplete
				fullWidth
				multiple
				size={ SIZE }
				disabled={ disabled }
				value={ selectedOptions }
				onChange={ handleChange }
				options={ options }
				getOptionLabel={ ( option ) => option.label }
				isOptionEqualToValue={ ( option, val ) => option.value === val.value }
				renderInput={ ( params ) => <TextField { ...params } /> }
				renderTags={ ( tagValues, getTagProps ) => (
					<MultiselectAutocompleteChipTags
						getLabel={ ( option ) => option.label }
						getTagProps={ getTagProps }
						values={ tagValues }
					/>
				) }
			/>
		</ControlActions>
	);
} );
