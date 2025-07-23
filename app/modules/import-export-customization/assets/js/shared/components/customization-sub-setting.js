import { Box, Typography, Switch } from '@elementor/ui';
import PropTypes from 'prop-types';

export const SubSetting = ( { label, settingKey, onSettingChange, checked = false } ) => (
	<Box sx={ {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		py: 1.5,
	} }>
		<Typography data-testid={ `${ settingKey }-label` } variant="body1" sx={ { fontWeight: 400 } }>
			{ label }
		</Typography>
		<Switch
			data-testid={ `${ settingKey }-switch` }
			checked={ checked }
			onChange={ ( e, isChecked ) => onSettingChange && onSettingChange( settingKey, isChecked ) }
			color="info"
			size="medium"
		/>
	</Box>
);

SubSetting.propTypes = {
	checked: PropTypes.bool,
	label: PropTypes.string.isRequired,
	settingKey: PropTypes.string.isRequired,
	onSettingChange: PropTypes.func,
};
