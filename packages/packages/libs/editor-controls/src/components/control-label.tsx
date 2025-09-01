import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { type FormLabelProps, Stack } from '@elementor/ui';

import { ControlAdornments } from '../control-adornments/control-adornments';
import { ControlFormLabel } from './control-form-label';

type ControlLabelProps = FormLabelProps & PropsWithChildren< object >;

export const ControlLabel = ( { children, ...props }: ControlLabelProps ) => {
	return (
		<Stack direction="row" alignItems="center" justifyItems="start" gap={ 0.25 }>
			<ControlFormLabel { ...props }>{ children }</ControlFormLabel>
			<ControlAdornments />
		</Stack>
	);
};
