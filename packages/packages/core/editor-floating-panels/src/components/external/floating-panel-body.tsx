import * as React from 'react';
import { Box, type BoxProps } from '@elementor/ui';

export default function FloatingPanelBody( props: BoxProps ) {
	return (
		<Box
			{ ...props }
			sx={ {
				flex: 1,
				overflowY: 'auto',
				...( props.sx ?? {} ),
			} }
		/>
	);
}
