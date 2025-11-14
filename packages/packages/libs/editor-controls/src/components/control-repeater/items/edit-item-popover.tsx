import * as React from 'react';
import { bindPopover, Box } from '@elementor/ui';

import { PropKeyProvider } from '../../../bound-prop-context';
import { RepeaterPopover } from '../../repeater/repeater-popover';
import { EMPTY_OPEN_ITEM, useRepeaterContext } from '../context/repeater-context';

export const EditItemPopover = ( { children }: { children: React.ReactNode } ) => {
	const { popoverState, openItemIndex, isOpen, rowRef, setOpenItemIndex, setRowRef } = useRepeaterContext();

	if ( ! isOpen || ! rowRef ) {
		return null;
	}

	const onClose = () => {
		setRowRef( null );
		popoverState.setAnchorEl( null );
		setOpenItemIndex( EMPTY_OPEN_ITEM );
	};

	return (
		<RepeaterPopover width={ rowRef.offsetWidth } { ...bindPopover( popoverState ) } onClose={ onClose }>
			<PropKeyProvider bind={ String( openItemIndex ) }>
				<Box>{ children }</Box>
			</PropKeyProvider>
		</RepeaterPopover>
	);
};
