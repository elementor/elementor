import * as React from 'react';
import { Drawer, type DrawerProps } from '@elementor/ui';

export default function Panel( { children, sx, ...props }: DrawerProps ) {
	return (
		<Drawer
			open={ true }
			variant="persistent"
			anchor="left"
			PaperProps={ {
				sx: {
					position: 'relative',
					width: '100%',
					bgcolor: 'background.default',
					border: 'none',
				},
			} }
			sx={ { height: '100%', ...sx } }
			{ ...props }
		>
			{ children }
		</Drawer>
	);
}
