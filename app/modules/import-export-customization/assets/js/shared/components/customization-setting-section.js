import { Box, Typography, Switch } from '@elementor/ui';
import PropTypes from 'prop-types';

export const SettingSection = ( {
	checked = false,
	title,
	description,
	children,
	settingKey,
	onSettingChange,
	hasToggle = true,
} ) => (
	<Box key={ settingKey } sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
		<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
			<Box>
				<Typography variant="body1" sx={ { fontWeight: 500 } }>
					{ title }
				</Typography>
				{ description && (
					<Typography data-testid={ `${ settingKey }-description` } variant="body1" color="text.secondary" sx={ { fontWeight: 400 } }>
						{ description }
					</Typography>
				) }
			</Box>
			{ hasToggle && (
				<Switch
					data-testid={ `${ settingKey }-switch` }
					checked={ checked }
					onChange={ ( e, isChecked ) => onSettingChange && onSettingChange( settingKey, isChecked ) }
					color="info"
					size="medium"
					sx={ { alignSelf: 'center' } }
				/>
			) }
		</Box>
		{ children && (
			<Box sx={ { mt: 2 } }>
				{ children }
			</Box>
		) }
	</Box>
);

SettingSection.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string,
	children: PropTypes.node,
	hasToggle: PropTypes.bool,
	checked: PropTypes.bool,
	settingKey: PropTypes.string,
	onSettingChange: PropTypes.func,
};
