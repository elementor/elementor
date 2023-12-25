import { usePopupState, bindMenu, bindTrigger, Stack, Divider } from '@elementor/ui';
import { mainMenu } from '../../locations';
import PopoverMenu from '../ui/popover-menu';
import ToolbarLogo from '../ui/toolbar-logo';

const { useMenuItems } = mainMenu;

export default function MainMenuLocation() {
	const menuItems = useMenuItems();

	const orderedGroups = [
		menuItems.default,
		menuItems.exits,
	];

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'elementor-v2-top-bar-main-menu',
	} );

	return (
		<Stack sx={ { paddingInlineStart: 4 } } direction="row" alignItems="center">
			<ToolbarLogo
				{ ...bindTrigger( popupState ) }
				selected={ popupState.isOpen }
			/>
			<PopoverMenu
				onClick={ popupState.close }
				{ ...bindMenu( popupState ) }
				PaperProps={ {
					sx: { mt: 4, marginInlineStart: -2 },
				} }
			>
				{
					orderedGroups
						.filter( ( group ) => group.length )
						.map( ( group, index ) => {
							return [
								index > 0 ? <Divider key={ index } orientation="horizontal" /> : null,
								...group.map(
									( { MenuItem, id } ) => <MenuItem key={ id } />
								),
							];
						} )
				}
			</PopoverMenu>
		</Stack>
	);
}
