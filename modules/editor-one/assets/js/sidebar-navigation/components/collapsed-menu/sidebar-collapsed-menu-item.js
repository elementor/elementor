import { useRef } from '@wordpress/element';
import { List, ListItem, ListItemButton, ListItemText, Popover, Tooltip } from '@elementor/ui';
import PropTypes from 'prop-types';
import { DEFAULT_ICON, ICON_MAP } from '../shared';
import {
	CollapsedIconButton,
	CollapsedMenuItemContainer,
	PopoverContent,
	PopoverTitle,
} from './styled-components';

const SidebarCollapsedMenuItem = ( {
	item,
	isActive,
	children,
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
		<CollapsedMenuItemContainer ref={ anchorRef } onMouseEnter={ handleMouseEnter }>
			{ hasChildren ? (
				<>
					<CollapsedIconButton isHighlighted={ isActive || isPopoverOpen }>
						<IconComponent sx={ { fontSize: 20 } } />
					</CollapsedIconButton>
					<Popover
						open={ isPopoverOpen }
						anchorEl={ anchorRef.current }
						onClose={ onClosePopover }
						anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
						transformOrigin={ { vertical: 'top', horizontal: 'left' } }
						sx={ { pointerEvents: 'none' } }
						slotProps={ {
							paper: {
								sx: { ml: 1, minWidth: 180, borderRadius: 1, pointerEvents: 'auto' },
								onMouseLeave: onClosePopover,
							},
						} }
						disableRestoreFocus
						hideBackdrop
					>
						<PopoverContent>
							<PopoverTitle>{ item.label }</PopoverTitle>
							<List disablePadding>
								{ children.map( ( childItem ) => (
									<ListItem key={ childItem.slug } disablePadding dense>
										<ListItemButton
											component="a"
											href={ childItem.url }
											selected={ childItem.slug === activeChildSlug }
											sx={ { px: 2, py: 0.5 } }
										>
											<ListItemText
												primary={ childItem.label }
												primaryTypographyProps={ { variant: 'body2' } }
											/>
										</ListItemButton>
									</ListItem>
								) ) }
							</List>
						</PopoverContent>
					</Popover>
				</>
			) : (
				<Tooltip title={ item.label } placement="right">
					<CollapsedIconButton onClick={ handleClick } isHighlighted={ isActive }>
						<IconComponent sx={ { fontSize: 20 } } />
					</CollapsedIconButton>
				</Tooltip>
			) }
		</CollapsedMenuItemContainer>
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

SidebarCollapsedMenuItem.defaultProps = {
	children: null,
};

export default SidebarCollapsedMenuItem;

