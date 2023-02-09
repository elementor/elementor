import { IconButton, IconButtonProps, Tooltip, styled } from '@elementor/ui';

type Props = IconButtonProps & {
	title?: string;
	selected?: boolean;
}

// The 'a' tag color is affected on hover by a global CSS color that applies on 'body a:hover {}'.
const StyledIconButton = styled( IconButton )<Props>( ( { theme } ) => ( {
	'&.MuiIconButton-root:hover': {
		color: theme.palette.text.primary,
	},
} ) );

export default function ToolbarMenuItem( { title, ...props }: Props ) {
	return (
		<Tooltip title={ title }>
			<StyledIconButton { ...props } aria-label={ title } />
		</Tooltip>
	);
}
