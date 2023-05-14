import { Fragment } from 'react';
import ToolbarMenu from '../ui/toolbar-menu';
import { utilitiesMenu } from '../../locations';
import { Divider } from '@elementor/ui';
import ToolbarMenuMore from '../ui/toolbar-menu-more';

const MAX_TOOLBAR_ACTIONS = 3;

const { useMenuItems } = utilitiesMenu;

export default function UtilitiesMenuLocation() {
	const menuItems = useMenuItems();

	const toolbarMenuItems = menuItems.default.slice( 0, MAX_TOOLBAR_ACTIONS );
	const popoverMenuItems = menuItems.default.slice( MAX_TOOLBAR_ACTIONS );

	return (
		<ToolbarMenu>
			{ toolbarMenuItems.map(
				( { MenuItem, id }, index ) => (
					<Fragment key={ id }>
						{ index === 0 && <Divider orientation="vertical" /> }
						<MenuItem />
					</Fragment>
				)
			) }
			{ popoverMenuItems.length > 0 && (
				<ToolbarMenuMore id="elementor-editor-top-bar-utilities-more">
					{ popoverMenuItems.map( ( { MenuItem, id } ) => <MenuItem key={ id } /> ) }
				</ToolbarMenuMore>
			) }
		</ToolbarMenu>
	);
}
