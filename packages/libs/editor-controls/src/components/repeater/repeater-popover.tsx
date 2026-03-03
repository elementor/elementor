import * as React from 'react';
import { Popover, type PopoverProps } from '@elementor/ui';

export const RepeaterPopover = ( { children, width, ...props }: PopoverProps & { width?: number } ) => {
	return (
		<Popover
			disablePortal
			disableEnforceFocus
			anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
			slotProps={ {
				paper: {
					sx: { marginBlockStart: 0.5, width, overflow: 'visible' },
				},
			} }
			{ ...props }
		>
			{ children }
		</Popover>
	);
};
