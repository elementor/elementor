import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { Stack } from '@elementor/ui';

import { ControlAdornments } from '../control-adornments/control-adornments';
import { ControlFormLabel } from './control-form-label';

export const ControlLabel = ( { children }: PropsWithChildren< object > ) => {
	return (
		<Stack direction="row" alignItems="center" justifyItems="start" gap={ 0.25 }>
			<ControlFormLabel>{ children }</ControlFormLabel>
			<ControlAdornments />
		</Stack>
	);
};
