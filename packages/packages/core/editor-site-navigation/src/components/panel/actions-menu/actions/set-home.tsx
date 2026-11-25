import * as React from 'react';
import { HomeIcon } from '@elementor/icons';
import { CircularProgress } from '@elementor/ui';
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

	const isPostHomepage = !! post.isHome;

	const handleClick = async () => {
		try {
			if ( isPostHomepage ) {
				await updateSettingsMutation.mutateAsync( { show_on_front: 'posts', page_on_front: 0 } );
			} else {
				await updateSettingsMutation.mutateAsync( { show_on_front: 'page', page_on_front: post.id } );
			}
		} catch {
			setError();
		} finally {
			closeMenu();
		}
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
				onClick: handleClick,
			} }
		/>
	);
}
