import * as React from 'react';
import { HomeIcon } from '@elementor/icons';
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePostListContext } from '../../../../contexts/post-list-context';
import { useHomepageActions } from '../../../../hooks/use-homepage-actions';
import useUser from '../../../../hooks/use-user';
import { type Post } from '../../../../types';
import ActionMenuItem from '../action-menu-item';

type SetHomeProps = {
	post: Post;
	closeMenu: () => void;
	onRequestRemoveHomepage?: () => void;
};

export default function SetHome( { post, closeMenu, onRequestRemoveHomepage }: SetHomeProps ) {
	const { updateSettingsMutation } = useHomepageActions();
	const { setError } = usePostListContext();
	const { data: user } = useUser();

	const isPostHomepage = !! post.isHome;

	const handleSetHomepage = async () => {
		try {
			await updateSettingsMutation.mutateAsync( { show_on_front: 'page', page_on_front: post.id } );
		} catch {
			setError();
		} finally {
			closeMenu();
		}
	};

	const handleMenuClick = () => {
		if ( isPostHomepage ) {
			onRequestRemoveHomepage?.();
			closeMenu();
			return;
		}

		void handleSetHomepage();
	};

	const canManageOptions = !! user?.capabilities?.manage_options;
	const isPostPublished = post.status === 'publish';
	const isSetHomeDisabled = ! canManageOptions || ! isPostPublished || updateSettingsMutation.isPending;
	const isRemoveHomeDisabled = ! canManageOptions || updateSettingsMutation.isPending;
	const isDisabled = isPostHomepage ? isRemoveHomeDisabled : isSetHomeDisabled;
	const title = isPostHomepage ? __( 'Remove as homepage', 'elementor' ) : __( 'Set as homepage', 'elementor' );

	return (
		<ActionMenuItem
			title={ title }
			icon={ ! updateSettingsMutation.isPending ? HomeIcon : CircularProgress }
			MenuItemProps={ {
				disabled: isDisabled,
				onClick: handleMenuClick,
			} }
		/>
	);
}

type RemoveHomepageDialogProps = {
	open: boolean;
	onClose: () => void;
};

export function RemoveHomepageDialog( { open, onClose }: RemoveHomepageDialogProps ) {
	const { updateSettingsMutation } = useHomepageActions();
	const { setError } = usePostListContext();

	if ( ! open ) {
		return null;
	}

	const dialogTitle = __( 'Remove this page as your homepage?', 'elementor' );
	const dialogBody = __(
		'Your homepage will go back to showing your latest posts. You can set a page as your homepage again at any time.',
		'elementor'
	);

	const handleRemove = async () => {
		try {
			await updateSettingsMutation.mutateAsync( { show_on_front: 'posts' } );
			onClose();
		} catch {
			setError();
			onClose();
		}
	};

	const handleCancel = () => {
		if ( updateSettingsMutation.isPending ) {
			return;
		}

		onClose();
	};

	return (
		<Dialog open onClose={ handleCancel } aria-labelledby="remove-homepage-dialog">
			<DialogTitle noWrap>{ dialogTitle }</DialogTitle>
			<Divider />
			<DialogContent>
				<DialogContentText>{ dialogBody }</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					color="secondary"
					onClick={ handleCancel }
					disabled={ updateSettingsMutation.isPending }
				>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button variant="contained" onClick={ handleRemove } disabled={ updateSettingsMutation.isPending }>
					{ ! updateSettingsMutation.isPending ? (
						__( 'Remove as homepage', 'elementor' )
					) : (
						<CircularProgress />
					) }
				</Button>
			</DialogActions>
		</Dialog>
	);
}