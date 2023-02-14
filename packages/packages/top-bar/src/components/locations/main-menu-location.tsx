import { usePopupState, bindMenu, bindTrigger, Stack, Divider } from '@elementor/ui';
import { useInjectionsOf } from '@elementor/locations';
import { LOCATION_MAIN_MENU_DEFAULT, LOCATION_MAIN_MENU_EXITS } from '../../locations';
import PopoverMenu from '../ui/popover-menu';
import ToolbarLogo from '../ui/toolbar-logo';

export default function MainMenuLocation() {
	const injectionsGroups = useInjectionsOf( [
		LOCATION_MAIN_MENU_DEFAULT,
		LOCATION_MAIN_MENU_EXITS,
	] );

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'elementor-v2-top-bar-main-menu',
	} );

	return (
		<Stack sx={ { px: 4 } } direction="row" alignItems="center">
			<ToolbarLogo
				{ ...bindTrigger( popupState ) }
				selected={ popupState.isOpen }
			/>
			<PopoverMenu onClick={ popupState.close } { ...bindMenu( popupState ) } sx={ { mt: 2 } }>
				{
					injectionsGroups
						.filter( ( injections ) => injections.length )
						.map( ( injections, index ) => {
							return [
								index > 0 ? <Divider key={ index } orientation="horizontal" /> : null,
								...injections.map(
									( { filler: Filler, id } ) => <Filler key={ id } />
								),
							];
						} )
				}
			</PopoverMenu>
		</Stack>
	);
}
