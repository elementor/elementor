import * as React from 'react';
import { type SyntheticEvent } from 'react';
import { stringArrayPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { Autocomplete, TextField } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { ChipsList } from '../components/chips-list';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export type ChipsOption = {
	label: string;
	value: string;
};

type ChipsControlProps = {
	options: ChipsOption[];
	freeChips?: boolean;
};

const SIZE = 'tiny';

const toChipsOption = ( val: string, options: ChipsOption[] ): ChipsOption =>
	options.find( ( opt ) => opt.value === val ) ?? { label: val, value: val };

const optionLabel = ( option: ChipsOption | string ): string => {
	if ( 'string' === typeof option ) {
		return option;
	}

	if ( option && 'string' === typeof option.label ) {
		return option.label;
	}

	if ( option && 'string' === typeof option.value ) {
		return option.value;
	}

	return '';
};

export const ChipsControl = createControl( ( { options, freeChips }: ChipsControlProps ) => {
	const { value, setValue, disabled } = useBoundProp( stringArrayPropTypeUtil );

	const selectedValues: string[] = ( value || [] )
		.map( ( item ) => stringPropTypeUtil.extract( item ) )
		.filter( ( val ): val is string => 'string' === typeof val );

	const selectedOptions = selectedValues.map( ( val ) => toChipsOption( val, options ) );

	const handleChange = ( _: SyntheticEvent, newValue: ( ChipsOption | string )[] ) => {
		setValue(
			newValue.map( ( option ) =>
				stringPropTypeUtil.create( 'string' === typeof option ? option : option.value )
			)
		);
	};

	return (
		<ControlActions>
			<Autocomplete
				fullWidth
				multiple
				freeSolo={ freeChips }
				size={ SIZE }
				disabled={ disabled }
				value={ selectedOptions }
				filterSelectedOptions
				onChange={ handleChange }
				options={ options }
				getOptionLabel={ optionLabel }
				isOptionEqualToValue={ ( option, val ) => option.value === val.value }
				renderInput={ ( params ) => <TextField { ...params } /> }
				renderTags={ ( tagValues, getTagProps ) => (
					<ChipsList getLabel={ optionLabel } getTagProps={ getTagProps } values={ tagValues } />
				) }
			/>
		</ControlActions>
	);
} );
