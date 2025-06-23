import * as React from 'react';
import { Box, type BoxProps } from '@elementor/ui';

export default function PanelBody( { children, sx, ...props }: BoxProps ) {
	return (
		<Box
			component="main"
			sx={ {
				overflowY: 'auto',
				height: '100%',
				...sx,
			} }
			{ ...props }
		>
			{ children }
		</Box>
	);
}
