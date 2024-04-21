/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Box, Alert } from '@elementor/ui';
import BulbIcon from '../icons/bulb-icon';
import useIntroduction from '../hooks/use-introduction';

export const VoicePromotionAlert = ( props ) => {
	const { isViewed, markAsViewed } = useIntroduction( props.introductionKey );
	if ( isViewed ) {
		return null;
	}

	return (
		<Box sx={ { mt: 2, ...props.sx } } alignItems="top">
			<Alert severity="info" variant="standard" icon={ <BulbIcon sx={ { alignSelf: 'flex-start' } } /> } onClose={ markAsViewed }>
				{ __( 'Get improved results from AI by adding personal context.' ) }
				<Box sx={ { ml: 0.25 } }>
					<a href="javascript: $e.route( 'panel/global/menu' ) ">{__(' Let’s do it', 'elementor')}</a>
				</Box>
			</Alert>
		</Box>
	);
};

VoicePromotionAlert.propTypes = {
	sx: PropTypes.object,
	introductionKey: PropTypes.string,
};

export default VoicePromotionAlert;
