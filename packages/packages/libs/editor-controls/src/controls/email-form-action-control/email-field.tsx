import * as React from 'react';
import { Grid } from '@elementor/ui';

import { PropKeyProvider } from '../../bound-prop-context';
import { ControlFormLabel } from '../../components/control-form-label';
import { TextControl } from '../text-control';

type EmailFieldProps = {
	bind: string;
	label: string;
	placeholder?: string;
};

export const EmailField = ( { bind, label, placeholder }: EmailFieldProps ) => (
	<PropKeyProvider bind={ bind }>
		<Grid container direction="column" gap={ 0.5 }>
			<Grid item>
				<ControlFormLabel>{ label }</ControlFormLabel>
			</Grid>
			<Grid item>
				<TextControl placeholder={ placeholder } />
			</Grid>
		</Grid>
	</PropKeyProvider>
);
