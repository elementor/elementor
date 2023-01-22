import { __ } from '@wordpress/i18n';
import { IconButton, usePopupState, bindMenu, bindTrigger, Box } from '@elementor/ui';
import { Slot } from '@elementor/locations';
import { LOCATION_MAIN_MENU } from '../../locations';
import PopoverMenu from '../popover-menu';
import ElementorLogo from '../elementor-logo';

export default function LocationMainMenu() {
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
				<Slot location={ LOCATION_MAIN_MENU } />
			</PopoverMenu>
		</Box>
	);
}
