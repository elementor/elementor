import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { IconButton, type IconButtonProps } from '@elementor/ui';

export const CONTENT_PANEL_ADD_ICON_SIZE = 'tiny';

type ContentPanelAddIconButtonProps = Omit< IconButtonProps, 'children' | 'size' | 'variant' >;

export default function ContentPanelAddIconButton( props: ContentPanelAddIconButtonProps ) {
	return (
		<IconButton size={ CONTENT_PANEL_ADD_ICON_SIZE } variant="outlined" { ...props }>
			<PlusIcon fontSize={ CONTENT_PANEL_ADD_ICON_SIZE } />
		</IconButton>
	);
}
