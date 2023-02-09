import { ToggleButton, ToggleButtonProps, Tooltip, styled } from '@elementor/ui';

type Props = Omit<ToggleButtonProps, 'onChange'> & {
	title?: string;
	onClick?: () => void;
}

// The 'a' tag color is affected on hover by a global CSS color that applies on 'body a:hover {}'.
const StyledToggleButton = styled( ToggleButton )<Props>( ( { theme } ) => ( {
	'&.MuiToggleButton-root:hover': {
		color: theme.palette.text.primary,
	},
} ) );

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
			<StyledToggleButton { ...props } onChange={ onClick } size="small" />
		</Tooltip>
	);
}
