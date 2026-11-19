import * as React from 'react';
import { isSidebarEnabled } from '@elementor/editor-sidebar';
import { Box, ToggleButton, type ToggleButtonProps, Tooltip } from '@elementor/ui';

type ToolbarMenuToggleItemProps = Omit< ToggleButtonProps, 'onChange' > & {
	title?: string;
	onClick?: () => void;
};

const LEGACY_TOOLBAR_ICON_SVG_SX = {
	fontSize: '1.25rem',
	height: '1em',
	width: '1em',
} as const;

export default function ToolbarMenuToggleItem( { title, onClick, ...props }: ToolbarMenuToggleItemProps ) {
	const sidebarChrome = isSidebarEnabled();

	return (
		<Tooltip title={ title }>
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<Box component="span" aria-label={ undefined }>
				<ToggleButton
					{ ...props }
					onChange={ onClick }
					aria-label={ title }
					size="small"
					sx={ {
						...( sidebarChrome ? { borderRadius: 1 } : {} ),
						border: 0,
						'&.Mui-disabled': {
							border: 0,
						},
						'& svg': LEGACY_TOOLBAR_ICON_SVG_SX,
					} }
				/>
			</Box>
		</Tooltip>
	);
}
