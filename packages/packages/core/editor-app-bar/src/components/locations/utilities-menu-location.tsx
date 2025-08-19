import * as React from 'react';
import { Fragment } from 'react';
import { Divider } from '@elementor/ui';

import { utilitiesMenu } from '../../locations';
import ToolbarMenu from '../ui/toolbar-menu';
import ToolbarMenuMore from '../ui/toolbar-menu-more';

const MAX_TOOLBAR_ACTIONS = 4;

const { useMenuItems } = utilitiesMenu;

export default function UtilitiesMenuLocation() {
	const menuItems = useMenuItems();

	// If there are more than 5 items, show the first 4 inline and the rest in the popover.
	// Otherwise, display all items inline.
	const shouldUsePopover = menuItems.default.length > MAX_TOOLBAR_ACTIONS + 1;

	const toolbarMenuItems = shouldUsePopover ? menuItems.default.slice( 0, MAX_TOOLBAR_ACTIONS ) : menuItems.default;
	const popoverMenuItems = shouldUsePopover ? menuItems.default.slice( MAX_TOOLBAR_ACTIONS ) : [];

	return (
		<ToolbarMenu>
			{ toolbarMenuItems.map( ( { MenuItem, id }, index ) => (
				<Fragment key={ id }>
					{ index === 0 && <Divider orientation="vertical" /> }
					<MenuItem />
				</Fragment>
			) ) }
			{ popoverMenuItems.length > 0 && (
				<ToolbarMenuMore id="elementor-editor-app-bar-utilities-more">
					{ popoverMenuItems.map( ( { MenuItem, id } ) => (
						<MenuItem key={ id } />
					) ) }
				</ToolbarMenuMore>
			) }
		</ToolbarMenu>
	);
}
