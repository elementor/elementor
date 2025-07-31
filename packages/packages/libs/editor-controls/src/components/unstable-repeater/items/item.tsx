import * as React from 'react';
import { useState } from 'react';
import { type PropValue } from '@elementor/editor-props';
import { bindTrigger, UnstableTag } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { RepeaterItemActionsSlot, RepeaterItemIconSlot, RepeaterItemLabelSlot } from '../../../locations';
import { type ItemProps } from '../types';
import { EditItemPopover } from './edit-item-popover';
import { usePopover } from './use-popover';

type AnchorEl = HTMLElement | null;

export const Item = < T extends PropValue >( {
	Label,
	Icon,
	Content,
	key,
	value,
	index,
	openOnMount,
}: ItemProps< T > ) => {
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
				actions={ <RepeaterItemActionsSlot index={ index ?? -1 } /> }
			/>
			<EditItemPopover anchorRef={ ref } setAnchorEl={ setAnchorEl } popoverProps={ popoverProps }>
				<Content anchorEl={ anchorEl } bind={ String( index ) } value={ value as T } />
			</EditItemPopover>
		</>
	);
};
