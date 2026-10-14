import * as React from 'react';
import { Box, type BoxProps, Divider } from '@elementor/ui';

export default function PanelFooter( { children, sx, ...props }: BoxProps ) {
	return (
		<>
			<Divider />
			<Box
				component="footer"
				sx={ {
					display: 'flex',
					position: 'sticky',
					bottom: 0,
					px: 2,
					py: 1.5,
				} }
				{ ...props }
			>
				{ children }
			</Box>
		</>
	);
}
