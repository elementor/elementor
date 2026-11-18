import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { Box, IconButton, ListItem, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getPostTypeCreateCapability, type Slug } from '../../api/post';
import { usePostListContext } from '../../contexts/post-list-context';
import useUser from '../../hooks/use-user';
import { contentPanelSectionAddRowSx } from './content-panel-chrome';

const SECTION_ADD_ICON_SIZE = 'tiny';

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
	const canCreate = Boolean( user?.capabilities?.[ createCapability ] );

	const onAdd = () => {
		onBeforeCreate?.();
		setEditMode( { mode: 'create', details: {} } );
	};

	return (
		<ListItem disablePadding dense sx={ contentPanelSectionAddRowSx }>
			<Stack
				alignItems="center"
				direction="row"
				gap={ 1 }
				sx={ {
					marginInlineEnd: -0.75,
					width: '100%',
				} }
			>
				<Box display="flex" alignItems="center" gap={ 1 } sx={ { flexGrow: 1, minWidth: 0 } }>
					<Typography color="text.secondary" component="span" sx={ { lineHeight: 1 } } variant="caption">
						{ label }
					</Typography>
				</Box>
				<IconButton
					aria-label={ label }
					disabled={ ! canCreate }
					size={ SECTION_ADD_ICON_SIZE }
					onClick={ onAdd }
				>
					<PlusIcon fontSize={ SECTION_ADD_ICON_SIZE } />
				</IconButton>
			</Stack>
		</ListItem>
	);
}
