import * as React from 'react';
import { bindPopover, Box, Popover } from '@elementor/ui';

import { PropKeyProvider } from '../../../bound-prop-context';
import { EMPTY_OPEN_ITEM, useRepeaterContext } from '../context/repeater-context';

export const EditItemPopover = ( { children }: { children: React.ReactNode } ) => {
	const { popoverState, openItemIndex, isOpen, rowRef, setOpenItemIndex, setRowRef, items } = useRepeaterContext();
	const popoverProps = bindPopover( popoverState );

	if ( ! isOpen || ! rowRef ) {
		return null;
	}

	const bind = items[ openItemIndex ].item.$$type;

	const onClose = () => {
		popoverProps.onClose?.();
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
