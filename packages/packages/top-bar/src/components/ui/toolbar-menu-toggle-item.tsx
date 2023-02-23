import { ToggleButton, ToggleButtonProps, Tooltip } from '@elementor/ui';

type Props = Omit<ToggleButtonProps, 'onChange'> & {
	title?: string;
	onClick?: () => void;
}

export default function ToolbarMenuToggleItem( { title, onClick, ...props }: Props ) {
	return (
		<Tooltip
			title={ title }
			PopperProps={ {
				sx: {
					'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
						mt: 6,
					},
				},
			} }
		>
			<span>
				<ToggleButton { ...props } onChange={ onClick } size="small" />
			</span>
		</Tooltip>
	);
}
