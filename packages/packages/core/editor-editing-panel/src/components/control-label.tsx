import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { ControlAdornments, ControlFormLabel } from '@elementor/editor-controls';
import { Stack } from '@elementor/ui';

export const ControlLabel = ( { children }: PropsWithChildren< object > ) => {
	return (
		<Stack direction="row" alignItems="center" justifyItems="start" gap={ 0.25 }>
			<ControlFormLabel>{ children }</ControlFormLabel>
			<ControlAdornments />
		</Stack>
	);
};
