import * as React from 'react';
import { Box, Popover } from '@elementor/ui';

import { PropKeyProvider } from '../../../bound-prop-context';
import { EMPTY_OPEN_ITEM, useRepeaterContext } from '../context/repeater-context';
import { type RepeatablePropValue } from '../types';

type EditItemPopoverProps = {
	children?: React.ReactNode;
};

export const EditItemPopover = ( { children }: EditItemPopoverProps ) => {
	const { popoverProps, openItemKey, isOpen, uniqueKeys, rowRef, setOpenItemKey, setRowRef, items } =
		useRepeaterContext();
	const index = uniqueKeys.indexOf( openItemKey );

	if ( ! isOpen || ! rowRef || index === -1 ) {
		return null;
	}

	const value = items[ index ];
	const bind = value.$$type;

	return (
		<Popover
			disablePortal
			slotProps={ {
				paper: {
					sx: { mt: 0.5, width: rowRef.offsetWidth },
				},
			} }
			anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
			anchorEl={ rowRef }
			{ ...popoverProps }
			onClose={ () => {
				setRowRef( null );
				setOpenItemKey( EMPTY_OPEN_ITEM );
			} }
		>
			<PropKeyProvider bind={ String( index ) }>
				<Box>
					{ React.isValidElement< { value: RepeatablePropValue; bind: string; index: number } >( children ) &&
						React.cloneElement( children, { value, bind, index } ) }
				</Box>
			</PropKeyProvider>
		</Popover>
	);
};
