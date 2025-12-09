import { Tooltip } from '@elementor/ui';
import PropTypes from 'prop-types';
import { CollapsedIconButton } from './styled-components';

const CollapsedMenuItemTooltip = ( { item, isActive, onClick, IconComponent } ) => {
	return (
		<Tooltip title={ item.label } placement="right">
			<CollapsedIconButton onClick={ onClick } isHighlighted={ isActive }>
				<IconComponent />
			</CollapsedIconButton>
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

