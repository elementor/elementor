import * as React from 'react';
import { isSidebarEnabled } from '@elementor/editor-sidebar';
import { Box, IconButton, type IconButtonProps, Tooltip as BaseTooltip, type TooltipProps } from '@elementor/ui';

type ToolbarMenuItemProps = IconButtonProps & {
	title?: string;
	selected?: boolean;
};

const LEGACY_TOOLBAR_ICON_SVG_SX = {
	fontSize: '1.25rem',
	height: '1em',
	width: '1em',
} as const;

export default function ToolbarMenuItem( { title, ...props }: ToolbarMenuItemProps ) {
	const sidebarChrome = isSidebarEnabled();

	return (
		<Tooltip title={ title }>
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<Box component="span" aria-label={ undefined }>
				<IconButton
					{ ...props }
					aria-label={ title }
					size="medium"
					sx={ {
						...( sidebarChrome ? { borderRadius: 1 } : {} ),
						'& svg': LEGACY_TOOLBAR_ICON_SVG_SX,
						'&:hover': {
							color: 'text.primary',
						},
					} }
				/>
			</Box>
		</Tooltip>
	);
}

function Tooltip( props: TooltipProps ) {
	return (
		<BaseTooltip
			PopperProps={ {
				sx: {
					'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
						mt: 2,
					},
				},
			} }
			{ ...props }
		/>
	);
}