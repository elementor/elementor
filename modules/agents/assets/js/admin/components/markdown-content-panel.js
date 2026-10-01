import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';

export const MarkdownContentPanel = () => {
	return (
		<Typography variant="body2" color="text.secondary">
			{ __( 'Markdown content settings coming soon.', 'elementor' ) }
		</Typography>
	);
};
