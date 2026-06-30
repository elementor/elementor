import * as React from 'react';
import { PlugIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { integrationsMenu } from '../../locations';
import PopoverMenu from '../ui/popover-menu';
import ToolbarMenuItem from '../ui/toolbar-menu-item';

const { useMenuItems } = integrationsMenu;

export default function IntegrationsMenuLocation() {
	const menuItems = useMenuItems();

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'elementor-v2-app-bar-integrations',
	} );

	if ( menuItems.default.length === 0 ) {
		return null;
	}

	return (
		<>
			<ToolbarMenuItem { ...bindTrigger( popupState ) } title={ __( 'Integrations', 'elementor' ) }>
				<PlugIcon />
			</ToolbarMenuItem>
			<PopoverMenu
				onClick={ popupState.close }
				{ ...bindMenu( popupState ) }
				marginThreshold={ 8 }
				open={ popupState.isOpen }
			>
				{ menuItems.default.map( ( { MenuItem: IntegrationsMenuItem, id } ) => (
					<IntegrationsMenuItem key={ id } />
				) ) }
			</PopoverMenu>
		</>
	);
}
