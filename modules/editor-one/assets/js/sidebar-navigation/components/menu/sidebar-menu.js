import { useMemo } from '@wordpress/element';
import { Divider } from '@elementor/ui';
import PropTypes from 'prop-types';
import MenuActiveStateResolver from '../../classes/menu-active-state-resolver';
import SidebarMenuItem from './sidebar-menu-item';
import { MenuList } from '../shared';

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
		<MenuList>
			{ menuItems.map( ( item ) => (
				<>
					{ item.has_divider_before && <Divider key={ `divider-${ item.slug }` } sx={ { my: 1 } } /> }
					<SidebarMenuItem
						key={ item.slug }
						item={ item }
						isActive={ activeStateResolver.isMenuActive( item ) }
						children={ getChildren( item ) }
						activeChildSlug={ activeChildSlug }
					/>
				</>
			) ) }
		</MenuList>
	);
};

SidebarMenu.propTypes = {
	menuItems: PropTypes.array.isRequired,
	level4Groups: PropTypes.object.isRequired,
	activeMenuSlug: PropTypes.string.isRequired,
	activeChildSlug: PropTypes.string.isRequired,
};

export default SidebarMenu;
