import { List } from '@elementor/ui';
import { useMemo } from '@wordpress/element';
import MenuActiveStateResolver from '../classes/menu-active-state-resolver';
import PropTypes from 'prop-types';
import SidebarMenuItem from './sidebar-menu-item';

const SidebarMenu = ( { menuItems, level4Groups, activeMenuSlug, activeChildSlug } ) => {
	const activeStateResolver = useMemo(
		() => new MenuActiveStateResolver( activeMenuSlug, activeChildSlug ),
		[ activeMenuSlug, activeChildSlug ],
	);

	const getChildren = ( item ) => {
		if ( ! item.group_id ) {
			return null;
		}

		const group = level4Groups[ item.group_id ];

		if ( ! group || ! group.items || ! group.items.length ) {
			return null;
		}

		return group.items;
	};

	return (
		<List sx={ { px: 2, py: 1 } }>
			{ menuItems.map( ( item ) => (
				<SidebarMenuItem
					key={ item.slug }
					item={ item }
					isActive={ activeStateResolver.isMenuActive( item ) }
					children={ getChildren( item ) }
					activeChildSlug={ activeChildSlug }
				/>
			) ) }
		</List>
	);
};

SidebarMenu.propTypes = {
	menuItems: PropTypes.array.isRequired,
	level4Groups: PropTypes.object.isRequired,
	activeMenuSlug: PropTypes.string.isRequired,
	activeChildSlug: PropTypes.string.isRequired,
};

export default SidebarMenu;

