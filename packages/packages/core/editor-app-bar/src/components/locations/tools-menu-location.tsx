import * as React from 'react';

import { toolsMenu } from '../../locations';
import ToolbarMenu from '../ui/toolbar-menu';
import ToolbarMenuMore from '../ui/toolbar-menu-more';
import IntegrationsMenuLocation from './integrations-menu-location';

const MAX_TOOLBAR_ACTIONS = 5;

const { useMenuItems } = toolsMenu;

export default function ToolsMenuLocation() {
	const menuItems = useMenuItems();

	const toolbarMenuItems = menuItems.default.slice( 0, MAX_TOOLBAR_ACTIONS );
	const popoverMenuItems = menuItems.default.slice( MAX_TOOLBAR_ACTIONS );

	return (
		<ToolbarMenu>
			{ toolbarMenuItems.map( ( { MenuItem, id } ) => (
				<MenuItem key={ id } />
			) ) }
			<IntegrationsMenuLocation />
			{ popoverMenuItems.length > 0 && (
				<ToolbarMenuMore id="elementor-editor-app-bar-tools-more">
					{ popoverMenuItems.map( ( { MenuItem, id } ) => (
						<MenuItem key={ id } />
					) ) }
				</ToolbarMenuMore>
			) }
		</ToolbarMenu>
	);
}
