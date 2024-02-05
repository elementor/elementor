import { IconButton } from '@elementor/ui';
import PropTypes from 'prop-types';
import Tooltip from '../../tooltip';

const ActionButton = ( { tooltipTitle, ...props } ) => {
	return (
		<Tooltip title={ tooltipTitle } placement="top">
			<IconButton
				type="button"
				size="small"
				disableRipple={ true }
				disableFocusRipple={ true }
				disableTouchRipple={ true }
				{ ...props } />
		</Tooltip>
	);
};

ActionButton.propTypes = {
	tooltipTitle: PropTypes.string.isRequired,
};

export default ActionButton;
