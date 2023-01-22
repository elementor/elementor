import * as React from 'react';
import { useInjectionsAt } from '@elementor/locations';
import { usePopupState, bindTrigger, bindMenu, SvgIcon } from '@elementor/ui';
import { LOCATION_TOOLS_MENU } from '../../locations';
import HorizontalMenu from '../misc/horizontal-menu';
import HorizontalMenuItem from '../misc/horizontal-menu-item';
import PopoverMenu from '../misc/popover-menu';

const MAX_HORIZONTAL_ACTIONS = 5;

export default function ToolsMenuLocation() {
	const injections = useInjectionsAt( LOCATION_TOOLS_MENU );

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'editor-v2-top-bar-tools-more',
	} );

	const horizontalInjections = injections.slice( 0, MAX_HORIZONTAL_ACTIONS );
	const popoverInjections = injections.slice( MAX_HORIZONTAL_ACTIONS );

	return (
		<HorizontalMenu>
			{ horizontalInjections.map(
				( { filler: Filler, id } ) => <Filler key={ id } />
			) }
			{ popoverInjections.length > 0 && (
				<>
					<HorizontalMenuItem { ...bindTrigger( popupState ) }>
						<SvgIcon viewBox="0 0 24 24">
							<path d="M11 4.75C11 4.33579 11.3358 4 11.75 4C12.1642 4 12.5 4.33579 12.5 4.75V11H18.75C19.1642 11 19.5 11.3358 19.5 11.75C19.5 12.1642 19.1642 12.5 18.75 12.5H12.5V18.75C12.5 19.1642 12.1642 19.5 11.75 19.5C11.3358 19.5 11 19.1642 11 18.75V12.5H4.75C4.33579 12.5 4 12.1642 4 11.75C4 11.3358 4.33579 11 4.75 11H11V4.75Z" />
						</SvgIcon>
					</HorizontalMenuItem>
					<PopoverMenu onClick={ popupState.close } { ...bindMenu( popupState ) }>
						{ popoverInjections.map(
							( { filler: Filler, id } ) => <Filler key={ id } />
						) }
					</PopoverMenu>
				</>
			) }
		</HorizontalMenu>
	);
}
