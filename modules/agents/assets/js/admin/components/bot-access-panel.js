import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';

export const BotAccessPanel = () => {
	return (
		<Typography variant="body2" color="text.secondary">
			{ __( 'Bot access control settings coming soon.', 'elementor' ) }
		</Typography>
	);
};
