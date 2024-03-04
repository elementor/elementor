import React from 'react';
import { Box, Alert } from '@elementor/ui';
import BulbIcon from '../icons/bulb-icon';
import useIntroduction from '../hooks/use-introduction';

export const VoicePromotionAlert = ( props ) => {
	const { isViewed, markAsViewed } = useIntroduction( props.introductionKey );

	return (
		! isViewed
			?			<Box sx={ { mt: 2, ...props.sx } } alignItems="top">
				<Alert severity="info" variant="standard" icon={ <BulbIcon sx={ { alignSelf: 'flex-start' } } /> } onClose={ markAsViewed }
				>
					{ __( 'Get improved results from AI by adding some personal context. Go to Site Settings > AI Context to get started.' ) }
				</Alert>
			</Box>
			: null
	);
};

VoicePromotionAlert.propTypes = {
	sx: PropTypes.object,
	introductionKey: PropTypes.string,
};

export default VoicePromotionAlert;
