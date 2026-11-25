import * as React from 'react';
import { useState } from 'react';
import { HomeIcon } from '@elementor/icons';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePostListContext } from '../../../../contexts/post-list-context';
import { useHomepageActions } from '../../../../hooks/use-homepage-actions';
import useUser from '../../../../hooks/use-user';
import { type Post } from '../../../../types';
import ActionMenuItem from '../action-menu-item';

export default function SetHome( { post, closeMenu }: { post: Post; closeMenu: () => void } ) {
	const { updateSettingsMutation } = useHomepageActions();
	const { setError } = usePostListContext();
	const { data: user } = useUser();
	const [ isRemoveDialogOpen, setIsRemoveDialogOpen ] = useState( false );

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
			setIsRemoveDialogOpen( true );
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
		<>
			<ActionMenuItem
				title={ title }
				icon={ ! updateSettingsMutation.isPending ? HomeIcon : CircularProgress }
				MenuItemProps={ {
					disabled: isDisabled,
					onClick: handleMenuClick,
				} }
			/>
			{ isRemoveDialogOpen && (
				<RemoveHomepageDialog
					setIsDialogOpen={ setIsRemoveDialogOpen }
					updateSettingsMutation={ updateSettingsMutation }
					setError={ setError }
				/>
			) }
		</>
	);
}

function RemoveHomepageDialog( {
	setIsDialogOpen,
	updateSettingsMutation,
	setError,
}: {
	setIsDialogOpen: React.Dispatch< React.SetStateAction< boolean > >;
	updateSettingsMutation: ReturnType< typeof useHomepageActions >[ 'updateSettingsMutation' ];
	setError: () => void;
} ) {
	const dialogTitle = __( 'Remove as homepage?', 'elementor' );
	const dialogBody = __(
		'Your site will show your latest posts on the front page. You can set a static homepage again from any page row.',
		'elementor'
	);

	const handleRemove = async () => {
		try {
			await updateSettingsMutation.mutateAsync( { show_on_front: 'posts' } );
			setIsDialogOpen( false );
		} catch {
			setError();
			setIsDialogOpen( false );
		}
	};

	const handleCancel = () => {
		if ( updateSettingsMutation.isPending ) {
			return;
		}

		setIsDialogOpen( false );
	};

	return (
		<Dialog open onClose={ handleCancel } aria-labelledby="remove-homepage-dialog">
			<DialogTitle noWrap>{ dialogTitle }</DialogTitle>
			<Divider />
			<DialogContent>
				<DialogContentText>{ dialogBody }</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button variant="contained" color="secondary" onClick={ handleCancel } disabled={ updateSettingsMutation.isPending }>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button variant="contained" onClick={ handleRemove } disabled={ updateSettingsMutation.isPending }>
					{ ! updateSettingsMutation.isPending ? __( 'Remove', 'elementor' ) : <CircularProgress /> }
				</Button>
			</DialogActions>
		</Dialog>
	);
}