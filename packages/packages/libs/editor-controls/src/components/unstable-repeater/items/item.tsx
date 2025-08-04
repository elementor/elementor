import * as React from 'react';
import { bindTrigger, UnstableTag } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { SlotChildren } from '../../../control-replacements';
import { DisableItemAction } from '../actions/disable-item-action';
import { DuplicateItemAction } from '../actions/duplicate-item-action';
import { RemoveItemAction } from '../actions/remove-item-action';
import { useRepeaterContext } from '../context/repeater-context';
import { RepeaterItemActionsSlot, RepeaterItemIconSlot, RepeaterItemLabelSlot } from '../locations';
import { type ItemProps, type RepeatablePropValue } from '../types';

export const Item = < T extends RepeatablePropValue >( {
	Label,
	Icon,
	value,
	index = -1,
	children,
}: React.PropsWithChildren< ItemProps< T > > ) => {
	const { popoverState, setRowRef, openItemIndex, setOpenItemIndex, uniqueKeys } = useRepeaterContext();
	const triggerProps = bindTrigger( popoverState );
	const key = uniqueKeys[ index ] ?? -1;

	const onClick = ( ev: React.MouseEvent ) => {
		triggerProps.onClick( ev );
		setOpenItemIndex( index );
	};

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
				ref={ ( ref ) => ref && openItemIndex === index && setRowRef( ref ) }
				variant="outlined"
				aria-label={ __( 'Open item', 'elementor' ) }
				{ ...triggerProps }
				onClick={ onClick }
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
		</>
	);
};
