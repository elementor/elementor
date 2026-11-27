import * as React from 'react';
import { hasLoadedEditorAngie, isAngieAvailable, openAngieInAskMode } from '@elementor/editor-mcp';
import { useIsSidebarRailLocked } from '@elementor/editor-sidebar';
import { AngieIcon, HelpIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	Box,
	IconButton,
	type IconButtonProps,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Tooltip,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { dispatchHelpClickEvent, HELP_CENTER_ANGIE_PROMPT, HELP_CENTER_URL } from '../hooks/use-action-props';

export default function SidebarHelp() {
	const popupState = usePopupState( { variant: 'popover', popupId: 'elementor-editor-sidebar-help' } );
	const hasAngieActive = hasLoadedEditorAngie() || isAngieAvailable();
	const isLocked = useIsSidebarRailLocked();
	const title = __( 'Help', 'elementor' );

	return (
		<>
			<Tooltip title={ title } placement="right">
				{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
				<Box component="span">
					<IconButton
						{ ...bindTrigger( popupState ) }
						disabled={ isLocked }
						aria-label={ title }
						size={ 'unstableTiny' as IconButtonProps[ 'size' ] }
					>
						<HelpIcon fontSize="small" />
					</IconButton>
				</Box>
			</Tooltip>
			<Menu
				{ ...bindMenu( popupState ) }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
				transformOrigin={ { vertical: 'bottom', horizontal: 'left' } }
				onClick={ popupState.close }
			>
				<MenuItem component="a" href={ HELP_CENTER_URL } target="_blank" onClick={ dispatchHelpClickEvent }>
					<ListItemIcon>
						<HelpIcon />
					</ListItemIcon>
					<ListItemText primary={ __( 'Help Center', 'elementor' ) } />
				</MenuItem>
				{ hasAngieActive && (
					<MenuItem onClick={ () => openAngieInAskMode( HELP_CENTER_ANGIE_PROMPT ) }>
						<ListItemIcon>
							<AngieIcon />
						</ListItemIcon>
						<ListItemText primary={ __( 'Ask Angie', 'elementor' ) } />
					</MenuItem>
				) }
			</Menu>
		</>
	);
}
