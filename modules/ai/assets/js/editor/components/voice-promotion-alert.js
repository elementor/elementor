import React from 'react';
import { Alert, Button } from '@elementor/ui';
import BulbIcon from '../icons/bulb-icon';
import useIntroduction from '../hooks/use-introduction';

export const VoicePromotionAlert = ( props ) => {
	const { isViewed, markAsViewed } = useIntroduction( props.introductionKey );

	return (
		! isViewed
			? <Alert severity="info" variant="standard" icon={ <BulbIcon /> } onClose={ markAsViewed } sx={ { m: 2, ...props.sx } }>
				{ `Get improved results from AI by adding some personal context. Go to Site Settings > AI Context to get started` } <Button variant="text" sx={ { display: 'inline' } } onClick={ markAsViewed }>Got it</Button>
			</Alert>
			: null
	);
};

VoicePromotionAlert.propTypes = {
	sx: PropTypes.object,
	introductionKey: PropTypes.string,
};

export default VoicePromotionAlert;
