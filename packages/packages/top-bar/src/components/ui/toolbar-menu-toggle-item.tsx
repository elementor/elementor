import { Box, ToggleButton, ToggleButtonProps, Tooltip } from '@elementor/ui';

export type ToolbarMenuToggleItemProps = Omit<ToggleButtonProps, 'onChange'> & {
	title?: string;
	onClick?: () => void;
}

export default function ToolbarMenuToggleItem( { title, onClick, ...props }: ToolbarMenuToggleItemProps ) {
	return (
		<Tooltip title={ title }>
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<Box component="span" aria-label={ undefined }>
				<ToggleButton { ...props } onChange={ onClick } aria-label={ title } size="small" />
			</Box>
		</Tooltip>
	);
}
