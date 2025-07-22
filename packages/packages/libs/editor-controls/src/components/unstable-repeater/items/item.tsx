import * as React from 'react';
import { useState } from 'react';
import { bindTrigger, UnstableTag } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { RepeaterItemIconSlot, RepeaterItemLabelSlot } from '../../../locations';
import { DisableItemAction } from '../actions/disable-item-action';
import { DuplicateItemAction } from '../actions/duplicate-item-action';
import { RemoveItemAction } from '../actions/remove-item-action';
import { type ItemProps } from '../types';
import { AddItemPopover } from './add-item-popover';
import { usePopover } from './use-popover';

type AnchorEl = HTMLElement | null;

export const Item = < T, >( { Label, Icon, Content, key, value, index, openOnMount }: ItemProps< T > ) => {
	const [ anchorEl, setAnchorEl ] = useState< AnchorEl >( null );
	const { popoverState, popoverProps, ref, setRef } = usePopover( openOnMount as boolean, () => {} );

	return (
		<>
			<UnstableTag
				key={ key }
				disabled={ false }
				label={
					<RepeaterItemLabelSlot value={ value }>
						<Label value={ value as T } />
					</RepeaterItemLabelSlot>
				}
				showActionsOnHover
				fullWidth
				ref={ setRef }
				variant="outlined"
				aria-label={ __( 'Open item', 'elementor' ) }
				{ ...bindTrigger( popoverState ) }
				startIcon={
					<RepeaterItemIconSlot value={ value }>
						<Icon value={ value as T } />
					</RepeaterItemIconSlot>
				}
				actions={
					<>
						<DuplicateItemAction />
						<DisableItemAction />
						<RemoveItemAction />
					</>
				}
			/>
			<AddItemPopover anchorRef={ ref } setAnchorEl={ setAnchorEl } popoverProps={ popoverProps }>
				<Content anchorEl={ anchorEl } bind={ String( index ) } value={ value as T } />
			</AddItemPopover>
		</>
	);
};
