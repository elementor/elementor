import * as React from 'react';

import { useMaxToolbarActions } from '../../contexts/app-bar-size-context';
import { AngieGuideLocation } from '../../extensions/angie/components/angie-guide-location';
import { toolsMenu } from '../../locations';
import ToolbarMenu from '../ui/toolbar-menu';
import ToolbarMenuMore from '../ui/toolbar-menu-more';
import IntegrationsMenuLocation from './integrations-menu-location';
import SendFeedbackPopupLocation from './send-feedback-popup-location';

const { useMenuItems } = toolsMenu;

export default function ToolsMenuLocation() {
	const menuItems = useMenuItems();
	const { tools: maxToolbarActions } = useMaxToolbarActions();

	const toolbarMenuItems = menuItems.default.slice( 0, maxToolbarActions );
	const popoverMenuItems = menuItems.default.slice( maxToolbarActions );

	return (
		<ToolbarMenu>
			{ toolbarMenuItems.map( ( { MenuItem, id } ) => (
				<MenuItem key={ id } />
			) ) }
			<AngieGuideLocation />
			<SendFeedbackPopupLocation />
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
