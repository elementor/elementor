import { useCallback, useMemo, useState } from '@wordpress/element';
import { Box } from '@elementor/ui';
import MenuActiveStateResolver from '../classes/menu-active-state-resolver';
import PropTypes from 'prop-types';
import SidebarCollapsedMenuItem from './sidebar-collapsed-menu-item';

const SidebarCollapsedMenu = ( { menuItems, level4Groups, activeMenuSlug, activeChildSlug } ) => {
	const [ openPopoverSlug, setOpenPopoverSlug ] = useState( null );

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

	const handleOpenPopover = useCallback( ( slug ) => {
		setOpenPopoverSlug( slug );
	}, [] );

	const handleClosePopover = useCallback( () => {
		setOpenPopoverSlug( null );
	}, [] );

	return (
		<Box sx={ { px: 1, py: 2 } } onMouseLeave={ handleClosePopover }>
			{ menuItems.map( ( item ) => (
				<SidebarCollapsedMenuItem
					key={ item.slug }
					item={ item }
					isActive={ activeStateResolver.isMenuActive( item ) }
					children={ getChildren( item ) }
					activeChildSlug={ activeChildSlug }
					isPopoverOpen={ openPopoverSlug === item.slug }
					onOpenPopover={ handleOpenPopover }
					onClosePopover={ handleClosePopover }
				/>
			) ) }
		</Box>
	);
};

SidebarCollapsedMenu.propTypes = {
	menuItems: PropTypes.array.isRequired,
	level4Groups: PropTypes.object.isRequired,
	activeMenuSlug: PropTypes.string.isRequired,
	activeChildSlug: PropTypes.string.isRequired,
};

export default SidebarCollapsedMenu;

