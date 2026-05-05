import * as React from 'react';
import { InfoAlert } from '@elementor/editor-ui';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ControlFormLabel } from '../components/control-form-label';
import { createControl } from '../create-control';
import { SelectControl, type SelectOption } from './select-control';

type Props = {
	label?: string;
	options: SelectOption[];
};

export const AttachmentTypeControl = createControl( ( { label, options }: Props ) => {
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
			<Grid item>
				<InfoAlert>
					{ __(
						'Linked uploads are saved to the server. Direct attachments will not appear under Submissions.',
						'elementor'
					) }
				</InfoAlert>
			</Grid>
		</Grid>
	);
} );
