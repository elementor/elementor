import * as React from 'react';
import { Box, type BoxProps } from '@elementor/ui';

export default function FloatingPanelFooter( { children, sx, ...props }: BoxProps ) {
	return (
		<Box
			{ ...props }
			sx={ {
				px: 2,
				py: 1.5,
				borderTop: 1,
				borderColor: 'var(--e-a-border-color)',
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				...( sx ?? {} ),
			} }
		>
			{ children }
		</Box>
	);
}
