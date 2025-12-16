import { Tooltip, ListItem } from '@elementor/ui';
import PropTypes from 'prop-types';
import { MenuItemButton, MenuIcon } from '../menu/styled-components';

const CollapsedMenuItemTooltip = ( { item, isActive, onClick, IconComponent } ) => {
	return (
		<Tooltip title={ item.label } placement="right">
			<ListItem disablePadding dense disableGutters>
				<MenuItemButton onClick={ onClick } selected={ isActive } sx={ { height: 36 } }>
					<MenuIcon>
						<IconComponent />
					</MenuIcon>
				</MenuItemButton>
			</ListItem>
		</Tooltip>
	);
};

CollapsedMenuItemTooltip.propTypes = {
	item: PropTypes.object.isRequired,
	isActive: PropTypes.bool.isRequired,
	onClick: PropTypes.func.isRequired,
	IconComponent: PropTypes.elementType.isRequired,
};

export default CollapsedMenuItemTooltip;

