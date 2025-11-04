import * as React from 'react';
import { ArrowDownSmallIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpSmallIcon } from '@elementor/icons';
import { Grid, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';

export function Direction( { value, onChange }: FieldProps ) {
	const availableDirections = [
		{ key: 'top', label: __( 'Up', 'elementor' ), icon: <ArrowUpSmallIcon fontSize="tiny" /> },
		{ key: 'bottom', label: __( 'Down', 'elementor' ), icon: <ArrowDownSmallIcon fontSize="tiny" /> },
		{ key: 'left', label: __( 'Left', 'elementor' ), icon: <ArrowLeftIcon fontSize="tiny" /> },
		{ key: 'right', label: __( 'Right', 'elementor' ), icon: <ArrowRightIcon fontSize="tiny" /> },
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Direction', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 }>
				<ToggleButtonGroup
					size="tiny"
					exclusive
					onChange={ ( event: React.MouseEvent< HTMLElement >, newValue: string ) => onChange( newValue ) }
					value={ value }
				>
					{ availableDirections.map( ( direction ) => {
						return (
							<Tooltip key={ direction.key } title={ direction.label } placement="top">
								<ToggleButton key={ direction.key } value={ direction.key }>
									{ direction.icon }
								</ToggleButton>
							</Tooltip>
						);
					} ) }
				</ToggleButtonGroup>
			</Grid>
		</>
	);
}
