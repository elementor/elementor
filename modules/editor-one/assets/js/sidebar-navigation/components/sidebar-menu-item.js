import { useState } from '@wordpress/element';
import {
	Collapse,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@elementor/ui';
import AdjustmentsIcon from '@elementor/icons/AdjustmentsIcon';
import ChevronDownIcon from '@elementor/icons/ChevronDownIcon';
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

const SidebarMenuItem = ( { item, isActive, children, activeChildSlug } ) => {
	const [ isExpanded, setIsExpanded ] = useState( isActive && !! children );
	const hasChildren = children && children.length > 0;
	const IconComponent = ICON_MAP[ item.icon ] || HomeIcon;

	const handleClick = () => {
		if ( hasChildren ) {
			setIsExpanded( ! isExpanded );
		} else {
			window.location.href = item.url;
		}
	};

	return (
		<>
			<ListItem disablePadding dense>
				<ListItemButton
					onClick={ handleClick }
					selected={ isActive && ! hasChildren }
					sx={ {
						borderRadius: 1,
						mb: 0.5,
					} }
				>
					<ListItemIcon sx={ { minWidth: 36 } }>
						<IconComponent sx={ { fontSize: 20 } } />
					</ListItemIcon>
					<ListItemText
						primary={ item.label }
						primaryTypographyProps={ {
							variant: 'body2',
						} }
					/>
					{ hasChildren && (
						<ChevronDownIcon
							sx={ {
								fontSize: 20,
								transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
								transition: 'transform 0.2s',
							} }
						/>
					) }
				</ListItemButton>
			</ListItem>
			{ hasChildren && (
				<Collapse in={ isExpanded } timeout="auto" unmountOnExit>
					<List disablePadding>
						{ children.map( ( childItem ) => (
							<ListItem key={ childItem.slug } disablePadding dense>
								<ListItemButton
									component="a"
									href={ childItem.url }
									selected={ childItem.slug === activeChildSlug }
									sx={ {
										borderRadius: 1,
										pl: 5.5,
										mb: 0.5,
									} }
								>
									<ListItemText
										primary={ childItem.label }
										primaryTypographyProps={ {
											variant: 'body2',
											color: 'text.secondary',
										} }
									/>
								</ListItemButton>
							</ListItem>
						) ) }
					</List>
				</Collapse>
			) }
		</>
	);
};

SidebarMenuItem.propTypes = {
	item: PropTypes.object.isRequired,
	isActive: PropTypes.bool.isRequired,
	children: PropTypes.array,
	activeChildSlug: PropTypes.string.isRequired,
};

export default SidebarMenuItem;

