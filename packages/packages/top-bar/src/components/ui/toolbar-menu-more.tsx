import { PropsWithChildren } from 'react';
import { bindMenu, bindTrigger, usePopupState } from '@elementor/ui';
import ToolbarMenuItem from './toolbar-menu-item';
import { __ } from '@wordpress/i18n';
import { DotsVerticalIcon } from '@elementor/icons';
import PopoverMenu from './popover-menu';

export type ToolbarMenuMoreProps = PropsWithChildren<{
	id: string;
}>

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
