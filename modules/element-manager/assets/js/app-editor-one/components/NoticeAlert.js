import { Box, Alert, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

export const NoticeAlert = ( { onDismiss } ) => {
	return (
		<Box sx={ { mb: 2 } }>
			<Alert severity="warning" onClose={ onDismiss }>
				<Typography component="strong" variant="body2" sx={ { fontWeight: 700 } }>
					{ __( 'Before you continue:', 'elementor' ) }
				</Typography>
				{ ' ' }
				{ __( 'Deactivating widgets here will remove them from both the Elementor Editor and your website, which can cause changes to your overall layout, design and what visitors see.', 'elementor' ) }
			</Alert>
		</Box>
	);
};

NoticeAlert.propTypes = {
	onDismiss: PropTypes.func.isRequired,
};

