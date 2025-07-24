import * as React from 'react';
import { Typography } from '@elementor/ui';

import { ControlAdornments } from '../../../control-adornments/control-adornments';

export const Label = ( { children }: { children: React.ReactNode } ) => {
	return (
		<>
			<Typography component="label" variant="caption" color="text.secondary">
				{ children }
			</Typography>
			<ControlAdornments />
		</>
	);
};
