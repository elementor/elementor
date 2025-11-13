import * as React from 'react';
import { bindTrigger } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { RepeaterTag } from '../../repeater/repeater-tag';
import { useRepeaterContext } from '../context/repeater-context';
import { RepeaterItemActionsSlot, RepeaterItemIconSlot, RepeaterItemLabelSlot } from '../locations';
import { type ItemProps, type RepeatablePropValue } from '../types';

export const Item = < T extends RepeatablePropValue >( { Label, Icon, actions }: ItemProps< T > ) => {
	const { popoverState, setRowRef, openItemIndex, setOpenItemIndex, index = -1, value } = useRepeaterContext();
	const triggerProps = bindTrigger( popoverState );

	const onClick = ( ev: React.MouseEvent ) => {
		triggerProps.onClick( ev );
		setOpenItemIndex( index );
	};

	const setRef = ( ref: HTMLDivElement | null ) => {
		if ( ! ref || openItemIndex !== index || ref === popoverState.anchorEl ) {
			return;
		}

		setRowRef( ref );
		popoverState.setAnchorEl( ref );
	};

	return (
		<RepeaterTag
			ref={ setRef }
			label={
				<RepeaterItemLabelSlot value={ value }>
					<Label value={ value as T } />
				</RepeaterItemLabelSlot>
			}
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
					{ actions }
				</>
			}
		/>
	);
};
