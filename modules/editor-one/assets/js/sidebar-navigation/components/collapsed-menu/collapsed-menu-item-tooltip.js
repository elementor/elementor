import { Tooltip } from '@elementor/ui';
import PropTypes from 'prop-types';
import { MenuItemButton, MenuIcon } from '../menu/styled-components';

const CollapsedMenuItemTooltip = ( { item, isActive, onClick, IconComponent } ) => {
	return (
		<Tooltip title={ item.label } placement="right">
			<MenuItemButton onClick={ onClick } selected={ isActive }>
				<MenuIcon>
					<IconComponent />
				</MenuIcon>
			</MenuItemButton>
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

