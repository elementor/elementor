import * as React from 'react';
import { useState } from 'react';
import { bindTrigger, UnstableTag } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { RepeaterItemActionsSlot, RepeaterItemIconSlot, RepeaterItemLabelSlot } from '../../../locations';
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
}: ItemProps< T > ) => {
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
				actions={ <RepeaterItemActionsSlot index={ index ?? -1 } bind={ bind } /> }
			/>
			<EditItemPopover anchorRef={ ref } setAnchorEl={ setAnchorEl } popoverProps={ popoverProps }>
				<Content anchorEl={ anchorEl } bind={ String( index ) } value={ value as T } />
			</EditItemPopover>
		</>
	);
};
