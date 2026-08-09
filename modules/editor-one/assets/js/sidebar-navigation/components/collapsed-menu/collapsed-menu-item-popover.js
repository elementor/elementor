import { List, ListItem, ListItemText } from '@elementor/ui';
import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';
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
	const handleChildClick = ( childItem ) => {
		EditorOneEventManager.sendSidebarMenuItemClicked( {
			eventId: childItem.event_id,
			groupEventId: item.event_id,
		} );
	};

	return (
		<ListItem disablePadding dense disableGutters onMouseEnter={ onMouseEnter } ref={ anchorRef }>
			<MenuItemButton selected={ isActive || isPopoverOpen } sx={ { height: 36 } }>
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
					<List disablePadding dense>
						<PopoverTitle>{ item.label }</PopoverTitle>
						{ children.map( ( childItem ) => (
							<ListItem key={ childItem.slug } disablePadding disableGutters dense sx={ { height: 28 } }>
								<PopoverListItemButton
									component="a"
									href={ childItem.url }
									onClick={ () => handleChildClick( childItem ) }
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
