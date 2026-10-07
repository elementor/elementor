import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { DefaultPanelLayout } from './default-panel-layout';

export const MarkdownContentPanel = ( { description } ) => {
	return (
		<DefaultPanelLayout description={ description }>
			<Typography variant="body2" color="text.secondary">
				{ __( 'Markdown content settings coming soon.', 'elementor' ) }
			</Typography>
		</DefaultPanelLayout>
	);
};

MarkdownContentPanel.propTypes = {
	description: PropTypes.string.isRequired,
};
