import { __ } from '@wordpress/i18n';
import { IconButton, usePopupState, bindMenu, bindTrigger, Box } from '@elementor/ui';
import { useInjectionsAt } from '@elementor/locations';
import { LOCATION_MAIN_MENU_DEFAULT, LOCATION_MAIN_MENU_EXITS } from '../../locations';
import PopoverMenu from '../misc/popover-menu';
import ElementorLogo from '../misc/elementor-logo';
import Divider from '../misc/divider';

export default function MainMenuLocation() {
	const injectionsGroups = useInjectionsAt( [
		LOCATION_MAIN_MENU_DEFAULT,
		LOCATION_MAIN_MENU_EXITS,
	] );

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'elementor-v2-top-bar-main-menu',
	} );

	return (
		<Box sx={ { paddingInline: '4px' } }>
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
								index > 0 ? <Divider key={ index } /> : null,
								...injections.map( ( { filler: Filler, id } ) => <Filler key={ id } /> ),
							];
						} )
				}
			</PopoverMenu>
		</Box>
	);
}
