import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { Button, ListItem } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getPostTypeCreateCapability, type Slug } from '../../api/post';
import { usePostListContext } from '../../contexts/post-list-context';
import useUser from '../../hooks/use-user';
import { contentPanelSectionAddRowSx } from './content-panel-chrome';

type Props = {
	postTypeSlug?: Slug;
	onBeforeCreate?: () => void;
};

function getSectionAddLabel( type: Slug ): string {
	if ( type === 'page' ) {
		return __( 'Add page', 'elementor' );
	}

	if ( type === 'post' ) {
		return __( 'Add post', 'elementor' );
	}

	return __( 'Add new', 'elementor' );
}

export default function SectionAddButton( { postTypeSlug, onBeforeCreate }: Props ) {
	const context = usePostListContext();
	const type = postTypeSlug ?? context.type;
	const setEditMode = context.setEditMode;
	const { data: user } = useUser();
	const createCapability = getPostTypeCreateCapability( type );
	const label = getSectionAddLabel( type );

	return (
		<ListItem disablePadding dense sx={ contentPanelSectionAddRowSx }>
			<Button
				color="inherit"
				disabled={ ! user?.capabilities?.[ createCapability ] }
				size="small"
				startIcon={ <PlusIcon fontSize="small" /> }
				sx={ { px: 1.5, textTransform: 'none' } }
				onClick={ () => {
					onBeforeCreate?.();
					setEditMode( { mode: 'create', details: {} } );
				} }
			>
				{ label }
			</Button>
		</ListItem>
	);
}
