import * as React from 'react';
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
		const config = extendedWindow?.elementor?.editorEvents?.config;

		if ( config ) {
			extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.elementorLogoDropdown, {
				location: config.locations.topBar,
				secondaryLocation: config.secondaryLocations.elementorLogo,
				trigger: config.triggers.dropdownClick,
				element: config.elements.buttonIcon,
			} );
		}

		toolbarLogoProps.onClick( e );
	};

	return (
		<Stack sx={ { paddingInlineStart: 3 } } direction="row" alignItems="center">
			<ToolbarLogo { ...toolbarLogoProps } onClick={ onToolbarClick } selected={ popupState.isOpen } />
			<PopoverMenu onClick={ popupState.close } { ...bindMenu( popupState ) } marginThreshold={ 8 }>
				{ menuItems.default.map( ( { MenuItem, id } ) => (
					<MenuItem key={ id } />
				) ) }
				{ menuItems.exits.length > 0 && <Divider /> }
				{ menuItems.exits.map( ( { MenuItem, id } ) => (
					<MenuItem key={ id } />
				) ) }
			</PopoverMenu>
		</Stack>
	);
}
