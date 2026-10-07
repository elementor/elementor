import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { DefaultPanelLayout } from './default-panel-layout';

export const BotAccessPanel = ( { description } ) => {
	return (
		<DefaultPanelLayout description={ description }>
			<Typography variant="body2" color="text.secondary">
				{ __( 'Bot access control settings coming soon.', 'elementor' ) }
			</Typography>
		</DefaultPanelLayout>
	);
};

BotAccessPanel.propTypes = {
	description: PropTypes.string.isRequired,
};
