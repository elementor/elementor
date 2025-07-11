import * as React from 'react';
import { useState } from 'react';
import { bindPopover, bindTrigger, Box, Popover, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { DisableItemAction } from '../actions/disable-item-action';
import { DuplicateItemAction } from '../actions/duplicate-item-action';
import { RemoveItemAction } from '../actions/remove-item-action';
import { ItemIcon } from './item-icon';
import { ItemLabel } from './item-label';
import { AddItemPopover } from "./add-item-popover";
import { usePopover } from "./use-popover";

type AnchorEl = HTMLElement | null;

export const Item = () => {
	const [ anchorEl, setAnchorEl ] = useState< AnchorEl >( null );
	const { popoverState, popoverProps, ref, setRef } = usePopover( true, () => {} );

	return (
		<>
			<UnstableTag
				disabled={ false }
				label={ <ItemLabel /> }
				showActionsOnHover
				fullWidth
				ref={ setRef }
				variant="outlined"
				aria-label={ __( 'Open item', 'elementor' ) }
				{ ...bindTrigger( popoverState ) }
				startIcon={ <ItemIcon /> }
				actions={
					<>
						<DuplicateItemAction />
						<DisableItemAction />
						<RemoveItemAction />
					</>
				}
			/>
			<AddItemPopover anchorRef={ ref } setAnchorEl={ setAnchorEl } popoverProps={ popoverProps } />
		</>
	);
};
