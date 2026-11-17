import * as React from 'react';
import { type ElementType } from 'react';
import { Box, IconButton, Tooltip } from '@elementor/ui';

import { getSidebarIconButtonSx } from '../../sidebar-icon-button';

export type Props = {
	title: string;
	id?: string;
	icon: ElementType;
	selected?: boolean;
	disabled?: boolean;
	visible?: boolean;
	onClick?: () => void;
};

export default function Action( { icon: Icon, title, selected, visible = true, ...props }: Props ) {
	if ( ! visible ) {
		return null;
	}

	return (
		<Tooltip title={ title } placement="right">
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<Box component="span">
				<IconButton
					{ ...props }
					aria-label={ title }
					aria-pressed={ selected }
					size="small"
					sx={ getSidebarIconButtonSx( { selected } ) }
				>
					<Icon />
				</IconButton>
			</Box>
		</Tooltip>
	);
}
