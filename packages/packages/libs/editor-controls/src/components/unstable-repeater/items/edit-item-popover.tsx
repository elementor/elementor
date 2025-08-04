import * as React from 'react';
import { Box, Popover } from '@elementor/ui';

import { PropKeyProvider } from '../../../bound-prop-context';
import { EMPTY_OPEN_ITEM, useRepeaterContext } from '../context/repeater-context';

type EditItemPopoverProps = {
	children?: React.ReactNode;
};

export const EditItemPopover = ( { children }: EditItemPopoverProps ) => {
	const { popoverProps, openItemIndex, isOpen, rowRef, setOpenItemIndex, setRowRef, items } = useRepeaterContext();

	if ( ! isOpen || ! rowRef || openItemIndex === EMPTY_OPEN_ITEM ) {
		return null;
	}

	const bind = items[ openItemIndex ].$$type;

	return (
		<Popover
			disablePortal
			slotProps={ {
				paper: {
					sx: { mt: 0.5, width: rowRef.offsetWidth },
				},
			} }
			anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
			{ ...popoverProps }
			anchorEl={ rowRef }
			onClose={ () => {
				setRowRef( null );
				setOpenItemIndex( EMPTY_OPEN_ITEM );
			} }
		>
			<PropKeyProvider bind={ String( openItemIndex ) }>
				<Box>
					{ React.isValidElement< { bind: string; index: number } >( children ) &&
						React.cloneElement( children, { bind, index: openItemIndex } ) }
				</Box>
			</PropKeyProvider>
		</Popover>
	);
};
