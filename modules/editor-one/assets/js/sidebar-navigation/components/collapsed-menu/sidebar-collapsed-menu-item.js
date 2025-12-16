import { useRef } from '@wordpress/element';
import PropTypes from 'prop-types';
import { DEFAULT_ICON, ICON_MAP } from '../shared';
import CollapsedMenuItemPopover from './collapsed-menu-item-popover';
import CollapsedMenuItemTooltip from './collapsed-menu-item-tooltip';
import { ListItem } from '@elementor/ui';

const SidebarCollapsedMenuItem = ( {
	item,
	isActive,
	children = null,
	activeChildSlug,
	isPopoverOpen,
	onOpenPopover,
	onClosePopover,
} ) => {
	const anchorRef = useRef( null );
	const hasChildren = children && children.length > 0;
	const IconComponent = ICON_MAP[ item.icon ] || DEFAULT_ICON;

	const handleMouseEnter = () => {
		if ( hasChildren ) {
			onOpenPopover( item.slug );
		} else {
			onClosePopover();
		}
	};

	const handleClick = () => {
		if ( ! hasChildren ) {
			window.location.href = item.url;
		}
	};

	return (
		<ListItem dense disableGutters ref={ anchorRef } onMouseEnter={ handleMouseEnter }>
			{ hasChildren ? (
				<CollapsedMenuItemPopover
					item={ item }
					children={ children }
					activeChildSlug={ activeChildSlug }
					isPopoverOpen={ isPopoverOpen }
					anchorEl={ anchorRef.current }
					onClose={ onClosePopover }
					IconComponent={ IconComponent }
					isActive={ isActive }
				/>
			) : (
				<CollapsedMenuItemTooltip
					item={ item }
					isActive={ isActive }
					onClick={ handleClick }
					IconComponent={ IconComponent }
				/>
			) }
		</ListItem>
	);
};

SidebarCollapsedMenuItem.propTypes = {
	item: PropTypes.object.isRequired,
	isActive: PropTypes.bool.isRequired,
	children: PropTypes.array,
	activeChildSlug: PropTypes.string.isRequired,
	isPopoverOpen: PropTypes.bool.isRequired,
	onOpenPopover: PropTypes.func.isRequired,
	onClosePopover: PropTypes.func.isRequired,
};

export default SidebarCollapsedMenuItem;
