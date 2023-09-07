import { IconButton, Tooltip } from '@elementor/ui';

const ActionButton = ( { tooltipTitle, ...props } ) => {
	return (
		<Tooltip title={ tooltipTitle } placement="top" componentsProps={ {
			tooltip: {
				sx: { m: '0 !important' } },
		} } >
			<IconButton type="button"
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
