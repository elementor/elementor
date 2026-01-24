import { Tooltip, ListItem } from '@elementor/ui';
import PropTypes from 'prop-types';
import { MenuItemButton, MenuIcon } from '../shared';

const CollapsedMenuItemTooltip = ( { item, isActive, onClick, IconComponent, onMouseEnter } ) => {
	return (
		<ListItem disablePadding dense disableGutters onMouseEnter={ onMouseEnter }>
			<Tooltip title={ item.label } placement="right">
				<MenuItemButton onClick={ onClick } selected={ isActive } sx={ { height: 36 } }>
					<MenuIcon>
						<IconComponent />
					</MenuIcon>
				</MenuItemButton>
			</Tooltip>
		</ListItem>
	);
};

CollapsedMenuItemTooltip.propTypes = {
	item: PropTypes.object.isRequired,
	isActive: PropTypes.bool.isRequired,
	onClick: PropTypes.func.isRequired,
	IconComponent: PropTypes.elementType.isRequired,
	onMouseEnter: PropTypes.func.isRequired,
};

export default CollapsedMenuItemTooltip;
