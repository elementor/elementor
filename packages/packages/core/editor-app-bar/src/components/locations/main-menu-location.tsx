import * as React from 'react';
import { isSidebarEnabled, SIDEBAR_WIDTH_VAR } from '@elementor/editor-sidebar';
import { bindMenu, bindTrigger, Divider, Stack, usePopupState } from '@elementor/ui';

import { mainMenu } from '../../locations';
import { type ExtendedWindow } from '../../types';
import PopoverMenu from '../ui/popover-menu';
import ToolbarLogo from '../ui/toolbar-logo';

const { useMenuItems } = mainMenu;

export default function MainMenuLocation() {
	const menuItems = useMenuItems();

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'elementor-v2-app-bar-main-menu',
	} );

	const toolbarLogoProps = bindTrigger( popupState );

	const onToolbarClick: React.MouseEventHandler = ( e ) => {
		const extendedWindow = window as unknown as ExtendedWindow;
		const config = extendedWindow?.elementorCommon?.eventsManager?.config;

		if ( config ) {
			extendedWindow.elementorCommon.eventsManager.dispatchEvent( config.names.topBar.elementorLogoDropdown, {
				location: config.locations.topBar,
				secondaryLocation: config.secondaryLocations.eLogoMenu,
				trigger: config.triggers.dropdownClick,
				element: config.elements.buttonIcon,
			} );
		}

		toolbarLogoProps.onClick( e );
	};

	const sidebarEnabled = isSidebarEnabled();

	return (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent={ sidebarEnabled ? 'center' : 'flex-start' }
			sx={ {
				flexShrink: 0,
				paddingInlineStart: sidebarEnabled ? 0 : 3,
				width: sidebarEnabled ? `var(${ SIDEBAR_WIDTH_VAR })` : undefined,
			} }
		>
			<ToolbarLogo
				{ ...toolbarLogoProps }
				alignWithSidebar={ sidebarEnabled }
				onClick={ onToolbarClick }
				selected={ popupState.isOpen }
			/>
			<PopoverMenu onClick={ popupState.close } { ...bindMenu( popupState ) } marginThreshold={ 8 }>
				{ menuItems.default.map( ( { MenuItem, id } ) => (
					<MenuItem key={ id } />
				) ) }
				<Divider />
				{ menuItems.help.map( ( { MenuItem, id } ) => (
					<MenuItem key={ id } />
				) ) }
				{ menuItems.exits.map( ( { MenuItem, id } ) => (
					<MenuItem key={ id } />
				) ) }
			</PopoverMenu>
		</Stack>
	);
}
