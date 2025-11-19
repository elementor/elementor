import * as React from 'react';
import { forwardRef } from 'react';
import { Box, Stack, Typography } from '@elementor/ui';

import { ControlAdornments } from '../../control-adornments/control-adornments';

export const RepeaterHeader = forwardRef(
	(
		{
			label,
			children,
			adornment: Adornment = ControlAdornments,
		}: React.PropsWithChildren< {
			label: string;
			adornment?: React.FC;
		} >,
		ref
	) => {
		return (
			<Stack
				direction="row"
				alignItems="center"
				gap={ 1 }
				sx={ { marginInlineEnd: -0.75, py: 0.25 } }
				ref={ ref }
			>
				<Box display="flex" alignItems="center" gap={ 1 } sx={ { flexGrow: 1 } }>
					<Typography component="label" variant="caption" color="text.secondary" sx={ { lineHeight: 1 } }>
						{ label }
					</Typography>
					<Adornment />
				</Box>
				{ children }
			</Stack>
		);
	}
);
