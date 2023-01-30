import { __ } from '@wordpress/i18n';
import { IconButton, usePopupState, bindMenu, bindTrigger, Box } from '@elementor/ui';
import { useInjectionsOf } from '@elementor/locations';
import { LOCATION_MAIN_MENU_DEFAULT, LOCATION_MAIN_MENU_EXITS } from '../../locations';
import PopoverMenu from '../ui/popover-menu';
import ElementorLogo from '../ui/elementor-logo';
import Divider from '../ui/divider';

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
		<Box sx={ { px: 2 } }>
			<IconButton { ...bindTrigger( popupState ) }>
				<ElementorLogo
					titleAccess={ __( 'Elementor Logo', 'elementor' ) }
					sx={ { width: '32px', height: '32px', fill: '#fff' } }
				/>
			</IconButton>
			<PopoverMenu onClick={ popupState.close } { ...bindMenu( popupState ) } spacing="6px">
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
		</Box>
	);
}
