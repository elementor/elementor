import * as React from 'react';
import { Box, Popover } from '@elementor/ui';

import { PropKeyProvider } from '../../../bound-prop-context';
import { EMPTY_OPEN_ITEM, useRepeaterContext } from '../context/repeater-context';

export const EditItemPopover = ( { children }: { children: React.ReactNode } ) => {
	const { popoverProps, openItemIndex, isOpen, rowRef, setOpenItemIndex, setRowRef, items } = useRepeaterContext();

	if ( ! isOpen || ! rowRef ) {
		return null;
	}

	const bind = items[ openItemIndex ].$$type;

	const onClose = ( ev: React.MouseEvent, reason: 'backdropClick' | 'escapeKeyDown' ) => {
		popoverProps.onClose?.( ev, reason );
		setRowRef( null );
		setOpenItemIndex( EMPTY_OPEN_ITEM );
	};

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
			onClose={ onClose }
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
