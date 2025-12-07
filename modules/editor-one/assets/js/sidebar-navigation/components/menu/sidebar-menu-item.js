import { useCallback, useState } from '@wordpress/element';
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from '@elementor/ui';
import PropTypes from 'prop-types';
import { DEFAULT_ICON, ICON_MAP } from '../shared';
import { ChildMenuItemButton, ExpandIcon, MenuItemButton } from './styled-components';

const STORAGE_KEY_PREFIX = 'elementor_sidebar_menu_expanded_';

const getStorageKey = ( slug ) => `${ STORAGE_KEY_PREFIX }${ slug }`;

const getInitialExpandedState = ( slug, hasChildren ) => {
	if ( ! hasChildren ) {
		return false;
	}

	const stored = localStorage.getItem( getStorageKey( slug ) );

	if ( null === stored ) {
		return true;
	}

	return 'true' === stored;
};

const SidebarMenuItem = ( { item, isActive, children, activeChildSlug } ) => {
	const hasChildren = children && children.length > 0;
	const [ isExpanded, setIsExpanded ] = useState( () => getInitialExpandedState( item.slug, hasChildren ) );
	const IconComponent = ICON_MAP[ item.icon ] || DEFAULT_ICON;

	const handleClick = useCallback( () => {
		if ( hasChildren ) {
			const newState = ! isExpanded;
			setIsExpanded( newState );
			localStorage.setItem( getStorageKey( item.slug ), String( newState ) );
		} else {
			window.location.href = item.url;
		}
	}, [ hasChildren, isExpanded, item.slug, item.url ] );

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

