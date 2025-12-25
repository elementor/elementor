import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { ControlAdornments, ControlFormLabel } from '@elementor/editor-controls';
import { type FormLabelProps, Stack } from '@elementor/ui';

type ControlLabelProps = FormLabelProps & PropsWithChildren< object >;

export const ControlLabel = ( { children, ...props }: ControlLabelProps ) => {
	return (
		<Stack direction="row" alignItems="center" justifyItems="start" gap={ 0.25 }>
			<ControlFormLabel { ...props }>{ children }</ControlFormLabel>
			<ControlAdornments />
		</Stack>
	);
};
