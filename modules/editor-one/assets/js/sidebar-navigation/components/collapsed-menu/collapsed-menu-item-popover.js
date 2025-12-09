import { List, ListItem, ListItemText } from '@elementor/ui';
import PropTypes from 'prop-types';
import {
	CollapsedIconButton,
	PopoverContent,
	PopoverListItemButton,
	PopoverTitle,
	StyledPopover,
} from './styled-components';

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
			<CollapsedIconButton isHighlighted={ isActive || isPopoverOpen }>
				<IconComponent />
			</CollapsedIconButton>
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


