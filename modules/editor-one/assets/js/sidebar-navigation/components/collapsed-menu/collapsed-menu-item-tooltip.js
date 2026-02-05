import { Tooltip, ListItem } from '@elementor/ui';
import PropTypes from 'prop-types';
import { MenuItemButton, MenuIcon } from '../shared';
import isRTL from '../../../shared/is-rtl';

const CollapsedMenuItemTooltip = ( { item, isActive, onClick, IconComponent, onMouseEnter } ) => {
	const isRtlLanguage = isRTL();

	return (
		<ListItem disablePadding dense disableGutters onMouseEnter={ onMouseEnter }>
			<Tooltip title={ item.label } placement={ isRtlLanguage ? 'left' : 'right' }>
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
