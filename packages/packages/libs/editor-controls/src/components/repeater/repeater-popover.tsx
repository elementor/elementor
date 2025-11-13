import * as React from 'react';
import { Popover, type PopoverProps } from '@elementor/ui';

export const RepeaterPopover = ( { children, width, ...props }: PopoverProps & { width?: number } ) => {
	return (
		<Popover
			disablePortal
			anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
			slotProps={ {
				paper: {
					sx: { mt: 0.5, width },
				},
			} }
			{ ...props }
		>
			{ children }
		</Popover>
	);
};
