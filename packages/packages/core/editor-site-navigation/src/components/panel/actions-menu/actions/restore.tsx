import * as React from 'react';
import { RefreshIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { usePostListContext } from '../../../../contexts/post-list-context';
import { usePostActions } from '../../../../hooks/use-posts-actions';
import { type Post } from '../../../../types';
import ActionMenuItem from '../action-menu-item';

export default function Restore( { post }: { post: Post } ) {
	const { setError, type } = usePostListContext();
	const { restorePost } = usePostActions( type );

	const handleClick = async () => {
		try {
			await restorePost.mutateAsync( post.id );
		} catch {
			setError();
		}
	};

	return (
		<ActionMenuItem
			title={ __( 'Restore', 'elementor' ) }
			icon={ RefreshIcon }
			MenuItemProps={ {
				disabled: restorePost.isPending || ! post.user_can.delete,
				onClick: () => void handleClick(),
			} }
		/>
	);
}
