import { useCallback, useState } from '@wordpress/element';
import { Collapse, List, ListItem, ListItemText } from '@elementor/ui';
import PropTypes from 'prop-types';
import { DEFAULT_ICON, ICON_MAP } from '../shared';
import { ChildListItem, ChildMenuItemButton, ExpandIcon, MenuIcon, MenuItemButton } from './styled-components';

const STORAGE_KEY_PREFIX = 'elementor_sidebar_menu_expanded_v2_';

const getStorageKey = ( slug ) => `${ STORAGE_KEY_PREFIX }${ slug }`;

const shouldExpandByDefault = ( children, activeChildSlug ) => {
	if ( ! children || ! children.length ) {
		return false;
	}

	return children.some( ( child ) => child.slug === activeChildSlug );
};

const getInitialExpandedState = ( slug, hasChildren, children, activeChildSlug ) => {
	if ( ! hasChildren ) {
		return false;
	}

	const isExpandedByDefault = shouldExpandByDefault( children, activeChildSlug );

	if ( isExpandedByDefault ) {
		localStorage.setItem( getStorageKey( slug ), String( true ) );
		return true;
	}

	const stored = localStorage.getItem( getStorageKey( slug ) );

	return 'true' === stored;
};

const SidebarMenuItem = ( { item, isActive, children, activeChildSlug } ) => {
	const hasChildren = children && children.length > 0;
	const [ isExpanded, setIsExpanded ] = useState( () => getInitialExpandedState( item.slug, hasChildren, children, activeChildSlug ) );
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
			<ListItem disablePadding dense disableGutters>
				<MenuItemButton onClick={ handleClick } selected={ isActive && ! hasChildren }>
					<MenuIcon>
						<IconComponent />
					</MenuIcon>
					<ListItemText primary={ item.label } primaryTypographyProps={ { variant: 'body2' } } />
					{ hasChildren && <ExpandIcon expanded={ isExpanded } /> }
				</MenuItemButton>
			</ListItem>
			{ hasChildren && (
				<Collapse in={ isExpanded } timeout="auto" unmountOnExit>
					<List disablePadding disableGutters>
						{ children.map( ( childItem ) => (
							<ChildListItem key={ childItem.slug } disablePadding dense disableGutters>
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
							</ChildListItem>
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
