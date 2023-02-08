import { MenuItem, MenuItemProps, styled, ListItemText, ListItemIcon } from '@elementor/ui';

type ExtraProps = {
	href?: string;
	target?: string;
	text?: string;
	icon?: JSX.Element;
}

// The MenuItem link color is affected on hover, by a global CSS color that applies on 'body a:hover {}'.
const StyleMenuItem = styled( MenuItem )( ( { theme } ) => ( {
	'&.MuiMenuItem-root:hover': {
		color: theme.palette.text.primary,
	},
} ) );

export default function PopoverMenuItem( { text, icon, onClick, href, target, disabled, ...props }: MenuItemProps & ExtraProps ) {
	return (
		<StyleMenuItem
			{ ...props }
			disabled={ disabled }
			onClick={ onClick }
			href={ href }
			target={ target }
			component={ href ? 'a' : null }
			LinkComponent={ href ? 'a' : null }
		>
			<ListItemIcon>{ icon }</ListItemIcon>
			<ListItemText primary={ text } />
		</StyleMenuItem>
	);
}
