import * as React from 'react';
import { InfoAlert } from '@elementor/editor-ui';
import { Grid } from '@elementor/ui';

import { ControlFormLabel } from '../components/control-form-label';
import { createControl } from '../create-control';
import { SelectControl, type SelectOption } from './select-control';

type Props = {
	label?: string;
	options: SelectOption[];
	infoMessage?: string;
};

export const AttachmentTypeControl = createControl( ( { label, options, infoMessage }: Props ) => {
	return (
		<Grid container direction="column" gap={ 1 }>
			{ label && (
				<Grid item>
					<ControlFormLabel>{ label }</ControlFormLabel>
				</Grid>
			) }
			<Grid item>
				<SelectControl options={ options } />
			</Grid>
			{ infoMessage && (
				<Grid item>
					<InfoAlert>{ infoMessage }</InfoAlert>
				</Grid>
			) }
		</Grid>
	);
} );
