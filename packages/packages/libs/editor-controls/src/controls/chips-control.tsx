import * as React from 'react';
import { type SyntheticEvent } from 'react';
import { stringArrayPropTypeUtil } from '@elementor/editor-props';
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
};

const SIZE = 'tiny';

export const ChipsControl = createControl( ( { options }: ChipsControlProps ) => {
	const { value, setValue, disabled } = useBoundProp( stringArrayPropTypeUtil );

	const selectedValues: string[] = value || [];

	const selectedOptions = selectedValues
		.map( ( val ) => options.find( ( opt ) => opt.value === val ) )
		.filter( ( opt ): opt is ChipsOption => opt !== undefined );

	const handleChange = ( _: SyntheticEvent, newValue: ChipsOption[] ) => {
		const values = newValue.map( ( option ) => option.value );
		setValue( values.length > 0 ? values : null );
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
				renderTags={ ( values, getTagProps ) =>
					values.map( ( option, index ) => {
						const { key, ...chipProps } = getTagProps( { index } );
						return <Chip key={ key } size="tiny" label={ option.label } { ...chipProps } />;
					} )
				}
			/>
		</ControlActions>
	);
} );
