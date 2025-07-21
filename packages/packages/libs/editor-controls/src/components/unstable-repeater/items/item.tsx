import * as React from 'react';
import { useState } from 'react';
import { bindPopover, bindTrigger, Box, Popover, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { DisableItemAction } from '../actions/disable-item-action';
import { DuplicateItemAction } from '../actions/duplicate-item-action';
import { RemoveItemAction } from '../actions/remove-item-action';
import { type ItemProps } from '../types';
import { AddItemPopover } from './add-item-popover';
import { usePopover } from './use-popover';

type AnchorEl = HTMLElement | null;

export const Item = < T, >( { Label, Icon, Content, key, value }: ItemProps< T > ) => {
	const [ anchorEl, setAnchorEl ] = useState< AnchorEl >( null );
	const { popoverState, popoverProps, ref, setRef } = usePopover( true, () => {} );

	return (
		<>
			<UnstableTag
				key={ key }
				disabled={ false }
				label={ <Label value={ value as T } /> }
				showActionsOnHover
				fullWidth
				ref={ setRef }
				variant="outlined"
				aria-label={ __( 'Open item', 'elementor' ) }
				{ ...bindTrigger( popoverState ) }
				startIcon={ <Icon value={ value as T } /> }
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
