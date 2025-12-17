import { List, ListItem, ListItemText, ListSubheader } from '@elementor/ui';
import PropTypes from 'prop-types';
import {
	MenuItemButton,
	MenuIcon,
	PopoverContent,
	PopoverListItemButton,
	PopoverTitle,
	StyledPopover,
} from '../shared';

const CollapsedMenuItemPopover = ( {
	item,
	children,
	activeChildSlug,
	isPopoverOpen,
	anchorEl,
	onClose,
	IconComponent,
	isActive,
	onMouseEnter,
	anchorRef,
} ) => {
	return (
		<ListItem disablePadding dense disableGutters onMouseEnter={ onMouseEnter } ref={ anchorRef }>
			<MenuItemButton selected={ isActive || isPopoverOpen } >
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
					<List disablePadding disableGutters dense>
						<PopoverTitle>{ item.label }</PopoverTitle>
						{ children.map( ( childItem ) => (
							<ListItem key={ childItem.slug } disablePadding disableGutters dense sx={ { height: 32 } }>
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
		</ListItem>
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
	onMouseEnter: PropTypes.func.isRequired,
	anchorRef: PropTypes.oneOfType( [ PropTypes.func, PropTypes.object ] ).isRequired,
};

export default CollapsedMenuItemPopover;
