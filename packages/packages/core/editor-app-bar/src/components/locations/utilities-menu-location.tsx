import * as React from 'react';
import { Fragment } from 'react';

import { useMaxToolbarActions } from '../../contexts/app-bar-size-context';
import { utilitiesMenu } from '../../locations';
import ToolbarMenu from '../ui/toolbar-menu';
import ToolbarMenuMore from '../ui/toolbar-menu-more';

const { useMenuItems } = utilitiesMenu;

export default function UtilitiesMenuLocation() {
	const menuItems = useMenuItems();
	const { utilities: maxToolbarActions } = useMaxToolbarActions();

	// If there are more items than the allowed max, show the max inline and the rest in the popover.
	// Otherwise, display all items inline.
	const shouldUsePopover = menuItems.default.length > maxToolbarActions;

	const toolbarMenuItems = shouldUsePopover ? menuItems.default.slice( 0, maxToolbarActions ) : menuItems.default;
	const popoverMenuItems = shouldUsePopover ? menuItems.default.slice( maxToolbarActions ) : [];

	return (
		<ToolbarMenu>
			{ toolbarMenuItems.map( ( { MenuItem, id } ) => (
				<Fragment key={ id }>
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
