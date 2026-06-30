import * as React from 'react';
import { EraseIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { usePostListContext } from '../../../../contexts/post-list-context';
import { type Post } from '../../../../types';
import ActionMenuItem from '../action-menu-item';

export default function Rename( { post }: { post: Post } ) {
	const { setEditMode } = usePostListContext();

	return (
		<ActionMenuItem
			title={ __( 'Rename', 'elementor' ) }
			icon={ EraseIcon }
			MenuItemProps={ {
				disabled: ! post.user_can.edit,
				onClick: () => {
					setEditMode( {
						mode: 'rename',
						details: {
							postId: post.id,
						},
					} );
				},
			} }
		/>
	);
}
