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
	Stack,
	Tooltip,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getCannotEditPanelItemMessage, type Slug } from '../../../../api/post';
import { usePostListContext } from '../../../../contexts/post-list-context';
import { type Post } from '../../../../types';
import PageTitleAndStatus from '../../../shared/page-title-and-status';
import Delete from '../../actions-menu/actions/delete';
import Duplicate from '../../actions-menu/actions/duplicate';
import ForceDelete from '../../actions-menu/actions/force-delete';
import Rename from '../../actions-menu/actions/rename';
import Restore from '../../actions-menu/actions/restore';
import SetHome from '../../actions-menu/actions/set-home';
import View from '../../actions-menu/actions/view';
import { contentPanelListItemButtonSx, getContentPanelListItemSx } from '../../content-panel-chrome';
import {
	SiteContentListItemActionsSlot,
	useSiteContentListItemActionsInjections,
} from './site-content-list-item-actions-location';

const DisabledPostTooltip = ( {
	children,
	isDisabled,
	postTypeSlug,
}: {
	children: React.ReactNode;
	isDisabled: boolean;
	postTypeSlug: Slug;
} ) => {
	if ( isDisabled ) {
		const title = (
			<Typography variant="caption">
				{ getCannotEditPanelItemMessage( postTypeSlug ) }
				<br />
				{ __( 'To edit it directly, contact the site owner', 'elementor' ) }
			</Typography>
		);

		return (
			<Tooltip title={ title } placement="bottom" arrow={ false }>
				{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
				<span>{ children }</span>
			</Tooltip>
		);
	}

	return <>{ children }</>;
};

export default function ListItemView( { post }: { post: Post } ) {
	const { type } = usePostListContext();
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
	const isTrashed = 'trash' === post.status;
	const isEditBlocked = ! post.user_can.edit && ! isTrashed;
	const isRowDisabled = isEditBlocked || isTrashed;
	const menuTriggerProps = bindTrigger( popupState );
	const hasListItemActions = useSiteContentListItemActionsInjections().length > 0;
	const showListItemActions = isActive && post.user_can.edit && ! isTrashed && hasListItemActions;

	const listRow = (
		<ListItem
			disablePadding
			sx={ getContentPanelListItemSx( showListItemActions ) }
			secondaryAction={
				<Stack alignItems="center" direction="row" spacing={ 0 }>
					{ showListItemActions && <SiteContentListItemActionsSlot post={ post } title={ title } /> }
					<IconButton
						aria-label={ __( 'More actions', 'elementor' ) }
						size="tiny"
						{ ...menuTriggerProps }
						onClick={ ( event: React.MouseEvent ) => {
							event.stopPropagation();
							menuTriggerProps.onClick?.( event );
						} }
					>
						<DotsVerticalIcon fontSize="tiny" />
					</IconButton>
				</Stack>
			}
		>
			<ListItemButton
				dense
				disableGutters
				disabled={ isRowDisabled }
				onClick={ () => {
					if ( isTrashed || isActive ) {
						return;
					}

					navigateToDocument( post.id );
				} }
				selected={ isActive }
				shape="rounded"
				sx={ contentPanelListItemButtonSx }
			>
				<ListItemText disableTypography sx={ { flex: 1, minWidth: 0 } }>
					<PageTitleAndStatus title={ title } status={ status } />
				</ListItemText>
				{ post.isHome && <HomeIcon titleAccess={ __( 'Homepage', 'elementor' ) } color="disabled" /> }
			</ListItemButton>
		</ListItem>
	);

	return (
		<>
			{ isEditBlocked ? (
				<DisabledPostTooltip isDisabled postTypeSlug={ type }>
					{ listRow }
				</DisabledPostTooltip>
			) : (
				listRow
			) }
			<Menu
				PaperProps={ { sx: { mt: 2, width: 200 } } }
				MenuListProps={ { dense: true } }
				{ ...bindMenu( popupState ) }
			>
				{ isTrashed ? (
					<>
						<Restore post={ post } />
						<ForceDelete post={ post } />
					</>
				) : (
					<>
						<Rename post={ post } />
						<Duplicate post={ post } popupState={ popupState } />
						<Delete post={ post } />
						<View post={ post } />
						{ type === 'page' && (
							<>
								<Divider />
								<SetHome post={ post } closeMenu={ () => popupState.close() } />
							</>
						) }
					</>
				) }
			</Menu>
		</>
	);
}
