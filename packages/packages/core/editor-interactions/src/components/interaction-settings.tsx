import * as React from 'react';
import { type SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { ControlFormLabel, PopoverContent } from '@elementor/editor-controls';
import { useBreakpoints } from '@elementor/editor-responsive';
import { Autocomplete, Chip, Grid, Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import type { InteractionItemValue } from '../types';
import { createInteractionBreakpoints, extractExcludedBreakpoints } from '../utils/prop-value-utils';

type BreakpointOption = {
	label: string;
	value: string;
};

type InteractionSettingsProps = {
	interaction: InteractionItemValue;
	onChange: ( interaction: InteractionItemValue ) => void;
};

const SIZE = 'tiny';

export const InteractionSettings = ( { interaction, onChange }: InteractionSettingsProps ) => {
	const breakpoints = useBreakpoints();

	const availableBreakpoints = useMemo(
		() => breakpoints.map( ( breakpoint ) => ( { label: breakpoint.label, value: String( breakpoint.id ) } ) ),
		[ breakpoints ]
	);

	const [ selectedBreakpoints, setSelectedBreakpoints ] = useState< BreakpointOption[] >( () => {
		const excluded = extractExcludedBreakpoints( interaction.breakpoints ).filter( ( excludedBreakpoint ) => {
			return availableBreakpoints.some( ( { value } ) => value === excludedBreakpoint );
		} );

		return availableBreakpoints.filter( ( { value } ) => {
			return ! excluded.includes( value );
		} );
	} );

	const handleBreakpointChange = useCallback(
		( _: SyntheticEvent, newValue: BreakpointOption[] ) => {
			setSelectedBreakpoints( newValue );

			const selectedValues = newValue.map( ( option ) => option.value );

			const newExcluded = availableBreakpoints
				.filter( ( breakpoint ) => ! selectedValues.includes( breakpoint.value ) )
				.map( ( breakpoint ) => breakpoint.value );

			const updatedInteraction: InteractionItemValue = {
				...interaction,
				...( newExcluded.length > 0 && {
					breakpoints: createInteractionBreakpoints( newExcluded ),
				} ),
			};

			if ( newExcluded.length === 0 ) {
				delete updatedInteraction.breakpoints;
			}

			onChange( updatedInteraction );
		},
		[ interaction, availableBreakpoints, onChange ]
	);

	return (
		<PopoverContent p={ 1.5 }>
			<Grid container spacing={ 1.5 }>
				<Grid item xs={ 12 }>
					<Stack direction="column" gap={ 1 }>
						<ControlFormLabel sx={ { width: '100%' } }>
							{ __( 'Trigger on', 'elementor' ) }
						</ControlFormLabel>
						<Autocomplete
							fullWidth
							multiple
							value={ selectedBreakpoints }
							onChange={ handleBreakpointChange }
							size={ SIZE }
							options={ availableBreakpoints }
							isOptionEqualToValue={ ( option, value ) => option.value === value.value }
							renderInput={ ( params ) => <TextField { ...params } /> }
							renderTags={ ( values, getTagProps ) =>
								values.map( ( option, index ) => {
									const { key, ...chipProps } = getTagProps( { index } );
									return <Chip key={ key } size={ SIZE } label={ option.label } { ...chipProps } />;
								} )
							}
						/>
					</Stack>
				</Grid>
			</Grid>
		</PopoverContent>
	);
};
