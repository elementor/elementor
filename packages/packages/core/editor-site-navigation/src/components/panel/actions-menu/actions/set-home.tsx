import * as React from 'react';
import { ConfirmationDialog } from '@elementor/editor-ui';
import { HomeIcon } from '@elementor/icons';
import { Button, CircularProgress, DialogActions } from '@elementor/ui';
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

	const handleCancel = () => {
		if ( updateSettingsMutation.isPending ) {
			return;
		}

		onClose();
	};

	const handleConfirm = async () => {
		if ( updateSettingsMutation.isPending ) {
			return;
		}

		try {
			await updateSettingsMutation.mutateAsync( { show_on_front: 'posts' } );
			onClose();
		} catch {
			setError();
			onClose();
		}
	};

	const isPending = updateSettingsMutation.isPending;
	const removeHomepageLabel = __( 'Remove as homepage', 'elementor' );

	return (
		<ConfirmationDialog open onClose={ handleCancel }>
			<ConfirmationDialog.Title iconColor="secondary">
				{ __( 'Remove this page as your homepage?', 'elementor' ) }
			</ConfirmationDialog.Title>
			<ConfirmationDialog.Content>
				<ConfirmationDialog.ContentText>
					{ __(
						'Your homepage will go back to showing your latest posts. You can set a page as your homepage again at any time.',
						'elementor'
					) }
				</ConfirmationDialog.ContentText>
			</ConfirmationDialog.Content>
			<DialogActions>
				<Button variant="contained" color="secondary" onClick={ handleCancel } disabled={ isPending }>
					{ __( 'Not now', 'elementor' ) }
				</Button>
				<Button
					autoFocus
					variant="contained"
					color="secondary"
					onClick={ () => void handleConfirm() }
					disabled={ isPending }
					sx={ { ml: 1 } }
				>
					{ ! isPending ? removeHomepageLabel : <CircularProgress /> }
				</Button>
			</DialogActions>
		</ConfirmationDialog>
	);
}
