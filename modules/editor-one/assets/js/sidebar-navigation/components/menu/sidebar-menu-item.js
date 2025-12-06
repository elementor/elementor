import { useState } from '@wordpress/element';
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from '@elementor/ui';
import PropTypes from 'prop-types';
import { DEFAULT_ICON, ICON_MAP } from '../shared';
import { ChildMenuItemButton, ExpandIcon, MenuItemButton } from './styled-components';

const SidebarMenuItem = ( { item, isActive, children, activeChildSlug } ) => {
	const [ isExpanded, setIsExpanded ] = useState( isActive && !! children );
	const hasChildren = children && children.length > 0;
	const IconComponent = ICON_MAP[ item.icon ] || DEFAULT_ICON;

	const handleClick = () => {
		if ( hasChildren ) {
			setIsExpanded( ! isExpanded );
		} else {
			window.location.href = item.url;
		}
	};

	return (
		<>
			<ListItem disablePadding dense>
				<MenuItemButton onClick={ handleClick } selected={ isActive && ! hasChildren }>
					<ListItemIcon sx={ { minWidth: 28 } }>
						<IconComponent sx={ { fontSize: 20 } } />
					</ListItemIcon>
					<ListItemText primary={ item.label } primaryTypographyProps={ { variant: 'body2' } } />
					{ hasChildren && <ExpandIcon expanded={ isExpanded } /> }
				</MenuItemButton>
			</ListItem>
			{ hasChildren && (
				<Collapse in={ isExpanded } timeout="auto" unmountOnExit>
					<List disablePadding>
						{ children.map( ( childItem ) => (
							<ListItem key={ childItem.slug } disablePadding dense>
								<ChildMenuItemButton
									component="a"
									href={ childItem.url }
									selected={ childItem.slug === activeChildSlug }
								>
									<ListItemText
										primary={ childItem.label }
										primaryTypographyProps={ { variant: 'body2', color: 'text.secondary' } }
									/>
								</ChildMenuItemButton>
							</ListItem>
						) ) }
					</List>
				</Collapse>
			) }
		</>
	);
};

SidebarMenuItem.propTypes = {
	item: PropTypes.object.isRequired,
	isActive: PropTypes.bool.isRequired,
	children: PropTypes.array,
	activeChildSlug: PropTypes.string.isRequired,
};

export default SidebarMenuItem;

