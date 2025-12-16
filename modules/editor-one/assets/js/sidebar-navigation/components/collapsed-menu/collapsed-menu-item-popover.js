import { List, ListItem, ListItemText, ListSubheader } from '@elementor/ui';
import PropTypes from 'prop-types';
import {
	MenuItemButton,
	MenuIcon,
	PopoverContent,
	PopoverListItemButton,
	PopoverTitle,
	StyledPopover,
} from '../menu/styled-components';

const CollapsedMenuItemPopover = ( {
	item,
	children,
	activeChildSlug,
	isPopoverOpen,
	anchorEl,
	onClose,
	IconComponent,
	isActive,
} ) => {
	return (
		<>
			<MenuItemButton selected={ isActive || isPopoverOpen }>
				<MenuIcon>
					<IconComponent />
				</MenuIcon>
			</MenuItemButton>
			<StyledPopover
				open={ isPopoverOpen }
				anchorEl={ anchorEl }
				onClose={ onClose }
				anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: 'left' } }
				slotProps={ {
					paper: {
						onMouseLeave: onClose,
					},
				} }
				disableRestoreFocus
				hideBackdrop
			>
				<PopoverContent>
					<List disablePadding>
						<ListSubheader><PopoverTitle elementType="div" variant="caption">{ item.label }</PopoverTitle></ListSubheader>
						{ children.map( ( childItem ) => (
							<ListItem key={ childItem.slug } disablePadding disableGutters dense>
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
	);
};

CollapsedMenuItemPopover.propTypes = {
	item: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	activeChildSlug: PropTypes.string.isRequired,
	isPopoverOpen: PropTypes.bool.isRequired,
	anchorEl: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	IconComponent: PropTypes.elementType.isRequired,
	isActive: PropTypes.bool.isRequired,
};

export default CollapsedMenuItemPopover;

