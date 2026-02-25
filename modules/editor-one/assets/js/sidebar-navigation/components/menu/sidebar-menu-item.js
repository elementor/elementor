import { useCallback, useState } from '@wordpress/element';
import { Collapse, List, ListItem, ListItemText } from '@elementor/ui';
import PropTypes from 'prop-types';
import { ChildListItem, ChildMenuItemButton, DEFAULT_ICON, ExpandIcon, ICON_MAP, MenuIcon, MenuItemButton } from '../shared';

const STORAGE_KEY_PREFIX = 'elementor_sidebar_menu_expanded_v2_';

const SidebarMenuItem = ( { item, isActive, children, activeChildSlug } ) => {
	const hasChildren = !! children?.length;
	const IconComponent = ICON_MAP[ item.icon ] || DEFAULT_ICON;

	const [ isExpanded, setIsExpanded ] = useState( () => {
		if ( ! hasChildren ) {
			return false;
		}

		const storageKey = `${ STORAGE_KEY_PREFIX }${ item.slug }`;
		const shouldExpand = children.some( ( child ) => child.slug === activeChildSlug );

		if ( shouldExpand ) {
			localStorage.setItem( storageKey, 'true' );
			return true;
		}

		const stored = localStorage.getItem( storageKey );

		if ( null === stored ) {
			return true;
		}

		return 'true' === stored;
	} );

	const handleClick = useCallback( () => {
		if ( hasChildren ) {
			setIsExpanded( ( prev ) => {
				const newState = ! prev;
				localStorage.setItem( `${ STORAGE_KEY_PREFIX }${ item.slug }`, String( newState ) );
				return newState;
			} );
		} else {
			window.location.href = item.url;
		}
	}, [ hasChildren, item.slug, item.url ] );

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
					<List disablePadding>
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
