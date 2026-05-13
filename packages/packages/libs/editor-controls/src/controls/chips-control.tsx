import * as React from 'react';
import { type SyntheticEvent } from 'react';
import { stringArrayPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { Autocomplete, Chip, TextField } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
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
		setValue(
			newValue.map( ( option ) =>
				stringPropTypeUtil.create( typeof option === 'string' ? option : option.value )
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
				getOptionLabel={ ( option ) => ( typeof option === 'string' ? option : option.label ) }
				isOptionEqualToValue={ ( option, val ) => option.value === val.value }
				renderInput={ ( params ) => <TextField { ...params } /> }
<<<<<<< HEAD
				renderTags={ ( values, getTagProps ) =>
					values.map( ( option, index ) => {
						const { key, ...chipProps } = getTagProps( { index } );
						return <Chip key={ key } size="tiny" label={ option.label } { ...chipProps } />;
					} )
				}
=======
				renderTags={ ( tagValues, getTagProps ) => (
					<ChipsList
						getLabel={ ( option ) => ( typeof option === 'string' ? option : option.label ) }
						getTagProps={ getTagProps }
						values={ tagValues }
					/>
				) }
>>>>>>> 8eaeebe394 (Internal: [V4] form actions email 2 [ED-23842])
			/>
		</ControlActions>
	);
} );
