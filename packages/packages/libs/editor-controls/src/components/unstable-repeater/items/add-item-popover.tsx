import * as React from 'react';
import { Box, Popover, type PopoverProps } from '@elementor/ui';

type AddItemPopoverProps = {
	anchorRef: HTMLElement | null;
	setAnchorEl: ( el: HTMLElement | null ) => void;
	popoverProps: Partial< PopoverProps >;
};

export const AddItemPopover = ( { anchorRef, setAnchorEl, popoverProps }: AddItemPopoverProps ) => {
	return (
		<Popover
			disablePortal
			slotProps={ {
				paper: {
					ref: setAnchorEl,
					sx: { mt: 0.5, width: anchorRef?.getBoundingClientRect().width },
				},
			} }
			anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
			anchorEl={ anchorRef }
			{ ...popoverProps }
		>
			<Box>blablabla</Box>
		</Popover>
	);
};
