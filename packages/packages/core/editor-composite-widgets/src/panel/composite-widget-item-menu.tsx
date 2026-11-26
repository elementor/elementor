import * as React from 'react';
import { DotsVerticalIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, IconButton, Menu, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type CompositeWidgetDefinition } from '../types';
import { CompositeWidgetItemMenuSlot, useCompositeWidgetItemMenuInjections } from './composite-widget-item-menu-location';

type Props = {
	definition: CompositeWidgetDefinition;
};

export function CompositeWidgetItemMenu( { definition }: Props ) {
	const hasMenuItems = useCompositeWidgetItemMenuInjections().length > 0;
	const popupState = usePopupState( { variant: 'popover', popupId: `composite-widget-${ definition.id }` } );

	if ( ! hasMenuItems ) {
		return null;
	}

	const trigger = bindTrigger( popupState );

	return (
		<>
			<IconButton
				size="tiny"
				aria-label={ __( 'More actions', 'elementor' ) }
				{ ...trigger }
				onClick={ ( event: React.MouseEvent ) => {
					event.stopPropagation();
					trigger.onClick( event );
				} }
			>
				<DotsVerticalIcon fontSize="tiny" />
			</IconButton>
			<Menu MenuListProps={ { dense: true } } { ...bindMenu( popupState ) }>
				<CompositeWidgetItemMenuSlot definition={ definition } closeMenu={ popupState.close } />
			</Menu>
		</>
	);
}
