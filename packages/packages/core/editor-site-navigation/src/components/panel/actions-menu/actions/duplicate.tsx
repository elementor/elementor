import * as React from 'react';
import { CopyIcon } from '@elementor/icons';
import { type PopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getPostTypeCreateCapability } from '../../../../api/post';
import { usePostListContext } from '../../../../contexts/post-list-context';
import useUser from '../../../../hooks/use-user';
import { type Post } from '../../../../types';
import ActionMenuItem from '../action-menu-item';

export default function Duplicate( { post, popupState }: { post: Post; popupState: PopupState } ) {
	const { setEditMode, type } = usePostListContext();
	const { data: user } = useUser();
	const createCapability = getPostTypeCreateCapability( type );
	const onClick = () => {
		popupState.close();

		setEditMode( {
			mode: 'duplicate',
			details: {
				postId: post.id,
				title: post.title.rendered,
			},
		} );
	};

	const isDisabled = ! user?.capabilities?.[ createCapability ];

	return (
		<ActionMenuItem
			title={ __( 'Duplicate', 'elementor' ) }
			icon={ CopyIcon }
			MenuItemProps={ {
				disabled: isDisabled,
				onClick,
			} }
		/>
	);
}
