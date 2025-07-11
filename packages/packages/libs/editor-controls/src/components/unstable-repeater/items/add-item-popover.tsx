import * as React from 'react';
import { Box, Popover } from '@elementor/ui';
import IntrinsicAttributes = React.JSX.IntrinsicAttributes;

type AddItemPopoverProps = {
	anchorRef: HTMLElement | null;
	setAnchorEl: ( el: HTMLElement | null ) => void;
	popoverProps: IntrinsicAttributes & AddItemPopoverProps;
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
			{ ...popoverProps }
			anchorEl={ anchorRef }
		>
			<Box>blablabla</Box>
		</Popover>
	);
};
