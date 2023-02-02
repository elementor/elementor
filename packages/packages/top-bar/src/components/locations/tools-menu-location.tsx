import * as React from 'react';
import { useInjectionsOf } from '@elementor/locations';
import { __ } from '@wordpress/i18n';
import { usePopupState, bindTrigger, bindMenu, SvgIcon } from '@elementor/ui';
import { LOCATION_TOOLS_MENU_DEFAULT } from '../../locations';
import ToolbarMenu from '../ui/toolbar-menu';
import ToolbarMenuItem from '../ui/toolbar-menu-item';
import PopoverMenu from '../ui/popover-menu';

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
						<SvgIcon viewBox="0 0 20 20" >
							<path d="M15.2084 9.16669C15.7837 9.16669 16.25 9.63306 16.25 10.2084C16.25 10.7837 15.7837 11.25 15.2084 11.25C14.6331 11.25 14.1667 10.7837 14.1667 10.2084C14.1667 9.63306 14.6331 9.16669 15.2084 9.16669ZM10.2084 9.16669C10.7837 9.16669 11.25 9.63306 11.25 10.2084C11.25 10.7837 10.7837 11.25 10.2084 11.25C9.63306 11.25 9.16669 10.7836 9.16669 10.2084C9.16669 9.63306 9.63306 9.16669 10.2084 9.16669ZM5.20835 9.16669C5.78365 9.16669 6.25002 9.63306 6.25002 10.2084C6.25002 10.7836 5.78365 11.25 5.20835 11.25C4.63306 11.25 4.16669 10.7836 4.16669 10.2084C4.16669 9.63306 4.63306 9.16669 5.20835 9.16669Z" fill="white" />
						</SvgIcon>
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
