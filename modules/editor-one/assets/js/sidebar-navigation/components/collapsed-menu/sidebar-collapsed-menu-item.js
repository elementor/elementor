import { useRef } from '@wordpress/element';
import { List, ListItem, ListItemText, Tooltip } from '@elementor/ui';
import PropTypes from 'prop-types';
import { DEFAULT_ICON, ICON_MAP } from '../shared';
import {
	CollapsedIconButton,
	CollapsedMenuItemContainer,
	PopoverContent,
	PopoverListItemButton,
	PopoverTitle,
	StyledPopover,
} from './styled-components';

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
		<CollapsedMenuItemContainer ref={ anchorRef } onMouseEnter={ handleMouseEnter }>
			{ hasChildren ? (
				<>
					<CollapsedIconButton isHighlighted={ isActive || isPopoverOpen }>
						<IconComponent />
					</CollapsedIconButton>
					<StyledPopover
						open={ isPopoverOpen }
						anchorEl={ anchorRef.current }
						onClose={ onClosePopover }
						anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
						transformOrigin={ { vertical: 'top', horizontal: 'left' } }
						slotProps={ {
							paper: {
								onMouseLeave: onClosePopover,
							},
						} }
						disableRestoreFocus
						hideBackdrop
					>
						<PopoverContent>
							<PopoverTitle variant="subtitle2">{ item.label }</PopoverTitle>
							<List disablePadding>
								{ children.map( ( childItem ) => (
									<ListItem key={ childItem.slug } disablePadding dense>
										<PopoverListItemButton
											component="a"
											href={ childItem.url }
											selected={ childItem.slug === activeChildSlug }
										>
											<ListItemText
												primary={ childItem.label }
												primaryTypographyProps={ { variant: 'body2' } }
											/>
										</PopoverListItemButton>
									</ListItem>
								) ) }
							</List>
						</PopoverContent>
					</StyledPopover>
				</>
			) : (
				<Tooltip title={ item.label } placement="right">
					<CollapsedIconButton onClick={ handleClick } isHighlighted={ isActive }>
						<IconComponent />
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

export default SidebarCollapsedMenuItem;
