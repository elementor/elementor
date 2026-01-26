import * as React from 'react';
import { useState } from 'react';
import type { StringPropValue } from '@elementor/editor-props';
import { Grid, Autocomplete, TextField } from '@elementor/ui';
import { ControlFormLabel, PopoverContent } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { InteractionItemValue } from '../types';
import { extractString } from '../utils/prop-value-utils';

type BreakpointOption = {
	label: string;
	value: string;
};

const availableBreakpoints: BreakpointOption[] = [
	{ label: __( 'Desktop', 'elementor' ), value: 'desktop' },
	{ label: __( 'Tablet', 'elementor' ), value: 'tablet' },
	{ label: __( 'Mobile', 'elementor' ), value: 'mobile' },
];

type InteractionSettingsProps = {
	interaction: InteractionItemValue;
	onChange: ( interaction: InteractionItemValue ) => void;
};

export const InteractionSettings = ( { interaction, onChange }: InteractionSettingsProps ) => {
	const excluded: string[] = [];

	const [ selectedBreakpoints, setSelectedBreakpoints ] = useState< BreakpointOption[] >( () => {
		return availableBreakpoints.filter( ( { value } ) => {
			return ! excluded.includes( value );
		} );
	} );

	const handleBreakpointChange = ( _event: React.SyntheticEvent, newValue: BreakpointOption[] ) => {
		setSelectedBreakpoints( newValue );
	};

	return (
		<PopoverContent p={ 1.5 }>
			<Grid container spacing={ 1.5 }>
				<Grid item xs={ 12 }>
					<ControlFormLabel sx={ { width: '100%' } }>{ __( 'Trigger on', 'elementor' ) }</ControlFormLabel>
				</Grid>
				<Grid id="interactions-settings-breakpoints" item xs={ 12 } sx={ { paddingTop: 0 } }>
					<Autocomplete
						fullWidth
						multiple
						value={ selectedBreakpoints }
						onChange={ handleBreakpointChange }
						size="tiny"
						options={ availableBreakpoints }
						renderInput={ ( params ) => <TextField { ...params } /> }
					/>
				</Grid>
			</Grid>
		</PopoverContent>
	);
};
