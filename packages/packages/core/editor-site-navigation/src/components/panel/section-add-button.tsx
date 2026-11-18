import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getPostTypeCreateCapability, postTypesMap, type Slug } from '../../api/post';
import { usePostListContext } from '../../contexts/post-list-context';
import useUser from '../../hooks/use-user';

type Props = {
	postTypeSlug?: Slug;
	onBeforeCreate?: () => void;
};

export default function SectionAddButton( { postTypeSlug, onBeforeCreate }: Props ) {
	const context = usePostListContext();
	const type = postTypeSlug ?? context.type;
	const setEditMode = context.setEditMode;
	const { data: user } = useUser();
	const createCapability = getPostTypeCreateCapability( type );
	const singularName = postTypesMap[ type ].labels.singular_name;

	// translators: %s: Post type singular name (e.g. Page, Post).
	const ariaLabel = __( 'New %s', 'elementor' ).replace( '%s', singularName );

	return (
		<IconButton
			size="small"
			aria-label={ ariaLabel }
			disabled={ ! user?.capabilities?.[ createCapability ] }
			sx={ { borderRadius: 1 } }
			onClick={ ( event ) => {
				event.stopPropagation();
				onBeforeCreate?.();
				setEditMode( { mode: 'create', details: {} } );
			} }
		>
			<PlusIcon fontSize="small" />
		</IconButton>
	);
}