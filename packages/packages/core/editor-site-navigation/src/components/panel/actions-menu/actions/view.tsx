import * as React from 'react';
import { EyeIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { postTypesMap } from '../../../../api/post';
import { usePostListContext } from '../../../../contexts/post-list-context';
import { type Post } from '../../../../types';
import ActionMenuItem from '../action-menu-item';

export default function View( { post }: { post: Post } ) {
	const { type } = usePostListContext();

	// translators: %s: Post type (e.g. Page, Post, etc.)
	const title = __( 'View %s', 'elementor' ).replace( '%s', postTypesMap[ type ].labels.singular_name );

	return (
		<ActionMenuItem
			title={ title }
			icon={ EyeIcon }
			MenuItemProps={ {
				onClick: () => window.open( post.link, '_blank' ),
			} }
		/>
	);
}
