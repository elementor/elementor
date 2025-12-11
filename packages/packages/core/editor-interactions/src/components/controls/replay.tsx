import * as React from 'react';

import { __ } from '@wordpress/i18n';
import { Grid } from '@elementor/ui';
import {
	ControlFormLabel,
	PopoverGridContainer,
	type ToggleButtonGroupItem,
	ToggleButtonGroupUi,
} from '@elementor/editor-controls';
import { CheckIcon, MinusIcon } from '@elementor/icons';

type ReplayProps = {
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
};

export function Replay({ value, onChange, disabled = true }: ReplayProps) {

	const options: ToggleButtonGroupItem< boolean >[] = [
		{
			value: true,
			label: __( 'Yes', 'elementor' ),
			renderContent: ( { size } ) =>
					<CheckIcon fontSize={ size } /> ,
		},
		{
			value: false,
			label: __( 'No', 'elementor' ),
			renderContent: ( { size } ) =>
                <MinusIcon fontSize={ size } /> ,
		},
	];
    

	return (
		<>
			<Grid item xs={ 12 }>
				<PopoverGridContainer>
					<Grid item xs={ 6 }>
						<ControlFormLabel>{ __( 'Replay', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 6 }>
						<ToggleButtonGroupUi items={ options } exclusive onChange={ onChange } value={ value } disabled={ disabled }/>
					</Grid>
				</PopoverGridContainer>
			</Grid>
		</>
	);
}