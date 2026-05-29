import * as React from 'react';
import { Box, type BoxProps } from '@elementor/ui';

export default function FloatingPanelFooter( props: BoxProps ) {
	return (
		<Box
			{ ...props }
			sx={ {
				px: 2,
				py: 1.5,
				borderTop: 1,
				borderColor: 'divider',
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				...( props.sx ?? {} ),
			} }
		/>
	);
}
