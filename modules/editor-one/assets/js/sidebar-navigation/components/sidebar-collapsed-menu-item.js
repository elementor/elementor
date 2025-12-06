import { useRef } from '@wordpress/element';
import {
	Box,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Popover,
	Tooltip,
	Typography,
} from '@elementor/ui';
import AdjustmentsIcon from '@elementor/icons/AdjustmentsIcon';
import FolderIcon from '@elementor/icons/FolderIcon';
import HomeIcon from '@elementor/icons/HomeIcon';
import InfoCircleIcon from '@elementor/icons/InfoCircleIcon';
import SendIcon from '@elementor/icons/SendIcon';
import SettingsIcon from '@elementor/icons/SettingsIcon';
import UsersIcon from '@elementor/icons/UsersIcon';
import PropTypes from 'prop-types';

const ICON_MAP = {
	adjustments: AdjustmentsIcon,
	folder: FolderIcon,
	home: HomeIcon,
	'info-circle': InfoCircleIcon,
	send: SendIcon,
	settings: SettingsIcon,
	tool: SettingsIcon,
	users: UsersIcon,
};

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
	const IconComponent = ICON_MAP[ item.icon ] || HomeIcon;

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
		<Box
			ref={ anchorRef }
			sx={ { display: 'flex', justifyContent: 'center', mb: 0.5 } }
			onMouseEnter={ handleMouseEnter }
		>
			{ hasChildren ? (
				<>
					<IconButton
						sx={ {
							width: 40,
							height: 40,
							borderRadius: 1,
							backgroundColor: isActive || isPopoverOpen ? 'action.selected' : 'transparent',
							'&:hover': {
								backgroundColor: 'action.hover',
							},
						} }
					>
						<IconComponent sx={ { fontSize: 20 } } />
					</IconButton>
					<Popover
						open={ isPopoverOpen }
						anchorEl={ anchorRef.current }
						onClose={ onClosePopover }
						anchorOrigin={ {
							vertical: 'top',
							horizontal: 'right',
						} }
						transformOrigin={ {
							vertical: 'top',
							horizontal: 'left',
						} }
						sx={ { pointerEvents: 'none' } }
						slotProps={ {
							paper: {
								sx: {
									ml: 1,
									minWidth: 180,
									borderRadius: 1,
									pointerEvents: 'auto',
								},
								onMouseLeave: onClosePopover,
							},
						} }
						disableRestoreFocus
						hideBackdrop
					>
						<Box sx={ { py: 1 } }>
							<Typography
								variant="subtitle2"
								sx={ {
									px: 2,
									py: 1,
									fontWeight: 600,
								} }
							>
								{ item.label }
							</Typography>
							<List disablePadding>
								{ children.map( ( childItem ) => (
									<ListItem key={ childItem.slug } disablePadding dense>
										<ListItemButton
											component="a"
											href={ childItem.url }
											selected={ childItem.slug === activeChildSlug }
											sx={ {
												px: 2,
												py: 0.5,
											} }
										>
											<ListItemText
												primary={ childItem.label }
												primaryTypographyProps={ {
													variant: 'body2',
												} }
											/>
										</ListItemButton>
									</ListItem>
								) ) }
							</List>
						</Box>
					</Popover>
				</>
			) : (
				<Tooltip title={ item.label } placement="right">
					<IconButton
						onClick={ handleClick }
						sx={ {
							width: 40,
							height: 40,
							borderRadius: 1,
							backgroundColor: isActive ? 'action.selected' : 'transparent',
							'&:hover': {
								backgroundColor: 'action.hover',
							},
						} }
					>
						<IconComponent sx={ { fontSize: 20 } } />
					</IconButton>
				</Tooltip>
			) }
		</Box>
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

