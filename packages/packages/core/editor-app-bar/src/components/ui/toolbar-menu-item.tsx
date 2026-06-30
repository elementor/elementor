import * as React from 'react';
import { Box, IconButton, type IconButtonProps, Tooltip as BaseTooltip, type TooltipProps } from '@elementor/ui';

type ToolbarMenuItemProps = IconButtonProps & {
	title?: string;
	selected?: boolean;
};

export default function ToolbarMenuItem( { title, ...props }: ToolbarMenuItemProps ) {
	return (
		<Tooltip title={ title }>
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<Box component="span" aria-label={ undefined }>
				<IconButton
					{ ...props }
					aria-label={ title }
					size="medium"
					sx={ {
						'& svg': {
							fontSize: '1.25rem',
							height: '1em',
							width: '1em',
						},
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
