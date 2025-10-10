import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { DotsVerticalIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import PopoverMenu from './popover-menu';
import ToolbarMenuItem from './toolbar-menu-item';

type ToolbarMenuMoreProps = PropsWithChildren< {
	id: string;
} >;

export default function ToolbarMenuMore( { children, id }: ToolbarMenuMoreProps ) {
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: id,
	} );

	return (
		<>
			<ToolbarMenuItem { ...bindTrigger( popupState ) } title={ __( 'More', 'elementor' ) }>
				<DotsVerticalIcon />
			</ToolbarMenuItem>
			<PopoverMenu onClick={ popupState.close } { ...bindMenu( popupState ) }>
				{ children }
			</PopoverMenu>
		</>
	);
}
