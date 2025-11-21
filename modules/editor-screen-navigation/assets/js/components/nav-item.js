import { ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from '@elementor/ui';

const NavItem = ( { item, isActive } ) => {
	return (
		<ListItem disablePadding>
			<ListItemButton
				href={ item.url }
				sx={ {
					px: 2,
					py: 1,
					'&:hover': {
						backgroundColor: 'action.hover',
					},
					backgroundColor: isActive ? 'action.selected' : 'transparent',
				} }
			>
				<ListItemIcon sx={ { minWidth: '32px' } }>
					<Box
						component="i"
						className={ item.icon }
						sx={ {
							fontSize: '16px',
							color: isActive ? 'primary.main' : 'text.secondary',
						} }
					/>
				</ListItemIcon>
				<ListItemText
					primary={ item.label }
					primaryTypographyProps={ {
						variant: 'body2',
						fontWeight: isActive ? 600 : 400,
						color: isActive ? 'primary.main' : 'text.primary',
						fontSize: '13px',
					} }
				/>
			</ListItemButton>
		</ListItem>
	);
};

export default NavItem;

