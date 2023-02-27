import * as React from 'react';
import { useInjectionsOf } from '@elementor/locations';
import { __ } from '@wordpress/i18n';
import { usePopupState, bindTrigger, bindMenu } from '@elementor/ui';
import { LOCATION_TOOLS_MENU_DEFAULT } from '../../locations';
import ToolbarMenu from '../ui/toolbar-menu';
import ToolbarMenuItem from '../ui/toolbar-menu-item';
import PopoverMenu from '../ui/popover-menu';
import { DotsVerticalIcon } from '@elementor/icons';

const MAX_TOOLBAR_ACTIONS = 5;

export default function ToolsMenuLocation() {
	const injections = useInjectionsOf( LOCATION_TOOLS_MENU_DEFAULT );

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'elementor-editor-top-bar-tools-more',
	} );

	const toolbarInjections = injections.slice( 0, MAX_TOOLBAR_ACTIONS );
	const popoverInjections = injections.slice( MAX_TOOLBAR_ACTIONS );

	return (
		<ToolbarMenu>
			{ toolbarInjections.map(
				( { filler: Filler, id } ) => <Filler key={ id } />
			) }
			{ popoverInjections.length > 0 && (
				<>
					<ToolbarMenuItem { ...bindTrigger( popupState ) } title={ __( 'More', 'elementor' ) }>
						<DotsVerticalIcon />
					</ToolbarMenuItem>
					<PopoverMenu onClick={ popupState.close } { ...bindMenu( popupState ) }>
						{ popoverInjections.map(
							( { filler: Filler, id } ) => <Filler key={ id } />
						) }
					</PopoverMenu>
				</>
			) }
		</ToolbarMenu>
	);
}
