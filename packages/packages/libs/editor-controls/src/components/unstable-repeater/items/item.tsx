import * as React from 'react';
import { useState } from 'react';
import { bindTrigger, UnstableTag } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { SlotChildren } from '../../../control-replacements';
import { DisableItemAction } from '../actions/disable-item-action';
import { DuplicateItemAction } from '../actions/duplicate-item-action';
import { RemoveItemAction } from '../actions/remove-item-action';
import { RepeaterItemActionsSlot, RepeaterItemIconSlot, RepeaterItemLabelSlot } from '../locations';
import { type ItemProps, type RepeatablePropValue } from '../types';
import { EditItemPopover } from './edit-item-popover';
import { usePopover } from './use-popover';

type AnchorEl = HTMLElement | null;

export const Item = < T extends RepeatablePropValue >( {
	Label,
	Icon,
	Content,
	key,
	value,
	index,
	openOnMount,
	children,
}: React.PropsWithChildren< ItemProps< T > > ) => {
	const [ anchorEl, setAnchorEl ] = useState< AnchorEl >( null );
	const { popoverState, popoverProps, ref, setRef } = usePopover( openOnMount as boolean, () => {} );
	const { bind } = useBoundProp();

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
						<RepeaterItemActionsSlot index={ index ?? -1 } />
						<SlotChildren
							whitelist={ [ DuplicateItemAction, DisableItemAction, RemoveItemAction ] as React.FC[] }
							props={ { index } }
							sorted
						>
							{ children }
						</SlotChildren>
					</>
				}
			/>
			<EditItemPopover anchorRef={ ref } setAnchorEl={ setAnchorEl } popoverProps={ popoverProps }>
				<Content anchorEl={ anchorEl } bind={ String( index ) } value={ value as T } />
			</EditItemPopover>
		</>
	);
};
