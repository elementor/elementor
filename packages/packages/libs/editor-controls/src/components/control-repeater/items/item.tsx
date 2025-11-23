import * as React from 'react';
import { bindTrigger } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { RepeatableControlContext } from '../../../hooks/use-repeatable-control-context';
import { RepeaterTag } from '../../repeater/repeater-tag';
import { useRepeaterContext } from '../context/repeater-context';
import { RepeaterItemActionsSlot, RepeaterItemIconSlot, RepeaterItemLabelSlot } from '../locations';
import { type ItemProps, type RepeatablePropValue } from '../types';

export const Item = < T extends RepeatablePropValue >( { Label, Icon, actions }: ItemProps< T > ) => {
	const {
		popoverState,
		setRowRef,
		openItemIndex,
		setOpenItemIndex,
		index = -1,
		value,
		isItemDisabled,
	} = useRepeaterContext();
	const repeatableContext = React.useContext( RepeatableControlContext );
	const disableOpen = !! repeatableContext?.props?.readOnly;
	const triggerProps = bindTrigger( popoverState );

	const onClick = ( ev: React.MouseEvent ) => {
		if ( disableOpen || isItemDisabled( index ) ) {
			return;
		}

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
			sx={ {
				minHeight: ( theme ) => theme.spacing( 3.5 ),
				...( isItemDisabled( index ) && {
					'[role="button"]': {
						cursor: 'not-allowed',
					},
				} ),
			} }
			actions={
				<>
					<RepeaterItemActionsSlot index={ index ?? -1 } />
					{ actions }
				</>
			}
		/>
	);
};
