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

export const ChipsControl = createControl( ( { options, freeChips }: ChipsControlProps ) => {
	const { value, setValue, disabled } = useBoundProp( stringArrayPropTypeUtil );

	const selectedValues: string[] = ( value || [] )
		.map( ( item ) => stringPropTypeUtil.extract( item ) )
		.filter( ( val ): val is string => val !== null );

	const selectedOptions = selectedValues.map( ( val ) => toChipsOption( val, options ) );

	const handleChange = ( _: SyntheticEvent, newValue: ( ChipsOption | string )[] ) => {
		const unique = new Set< string >();
		const deduped: ChipsOption[] = [];

		for ( const item of newValue ) {
			const chipValue = typeof item === 'string' ? item : item.value;

			if ( ! unique.has( chipValue ) ) {
				unique.add( chipValue );
				deduped.push( typeof item === 'string' ? { label: item, value: item } : item );
			}
		}

		setValue( deduped.map( ( option ) => stringPropTypeUtil.create( option.value ) ) );
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
				onChange={ handleChange }
				options={ options }
				getOptionLabel={ ( option ) => ( typeof option === 'string' ? option : option.label ) }
				isOptionEqualToValue={ ( option, val ) => option.value === val.value }
				renderInput={ ( params ) => <TextField { ...params } /> }
				renderTags={ ( tagValues, getTagProps ) => (
					<ChipsList
						getLabel={ ( option ) => ( typeof option === 'string' ? option : option.label ) }
						getTagProps={ getTagProps }
						values={ tagValues }
					/>
				) }
			/>
		</ControlActions>
	);
} );
