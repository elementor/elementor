import * as React from 'react';
import {
	__useActiveDocument as useActiveDocument,
	__useNavigateToDocument as useNavigateToDocument,
} from '@elementor/editor-documents';
import { DotsVerticalIcon, HomeIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	Divider,
	IconButton,
	ListItem,
	ListItemButton,
	ListItemText,
	Menu,
	Tooltip,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type Post } from '../../../../types';
import PageTitleAndStatus from '../../../shared/page-title-and-status';
import Delete from '../../actions-menu/actions/delete';
import Duplicate from '../../actions-menu/actions/duplicate';
import Rename from '../../actions-menu/actions/rename';
import SetHome from '../../actions-menu/actions/set-home';
import View from '../../actions-menu/actions/view';

const DisabledPostTooltip = ( { children, isDisabled }: { children: React.ReactNode; isDisabled: boolean } ) => {
	if ( isDisabled ) {
		const title = (
			<Typography variant="caption">
				You cannot edit this page.
				<br />
				To edit it directly, contact the site owner
			</Typography>
		);

		return (
			<Tooltip title={ title } placement="bottom" arrow={ false }>
				{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
				{ children }
			</Tooltip>
		);
	}

	return <>{ children }</>;
};

export default function ListItemView( { post }: { post: Post } ) {
	const activeDocument = useActiveDocument();
	const navigateToDocument = useNavigateToDocument();

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'post-actions',
		disableAutoFocus: true,
	} );

	const isActive = activeDocument?.id === post.id;
	const status = isActive ? activeDocument?.status.value : post.status;
	const title = isActive ? activeDocument?.title : post.title.rendered;
	const isDisabled = ! post.user_can.edit;

	return (
		<>
			<DisabledPostTooltip isDisabled={ isDisabled }>
				<ListItem
					disablePadding
					secondaryAction={
						<IconButton value size="small" { ...bindTrigger( popupState ) }>
							<DotsVerticalIcon fontSize="small" />
						</IconButton>
					}
				>
					<ListItemButton
						selected={ isActive }
						disabled={ isDisabled }
						onClick={ () => {
							if ( ! isActive ) {
								navigateToDocument( post.id );
							}
						} }
						dense
					>
						<ListItemText disableTypography={ true }>
							<PageTitleAndStatus title={ title } status={ status } />
						</ListItemText>
						{ post.isHome && <HomeIcon titleAccess={ __( 'Homepage', 'elementor' ) } color="disabled" /> }
					</ListItemButton>
				</ListItem>
			</DisabledPostTooltip>
			<Menu
				PaperProps={ { sx: { mt: 2, width: 200 } } }
				MenuListProps={ { dense: true } }
				{ ...bindMenu( popupState ) }
			>
				<Rename post={ post } />
				<Duplicate post={ post } popupState={ popupState } />
				<Delete post={ post } />
				<View post={ post } />
				<Divider />
				<SetHome post={ post } closeMenu={ () => popupState.close() } />
			</Menu>
		</>
	);
}
