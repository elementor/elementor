import React from 'react';
import { Box, Alert, Link } from '@elementor/ui';
import BulbIcon from '../icons/bulb-icon';
import useIntroduction from '../hooks/use-introduction';

export const VoicePromotionAlert = ( props ) => {
	const { isViewed, markAsViewed } = useIntroduction( props.introductionKey );
	if ( isViewed ) {
		console.log( 'VoicePromotionAlert isViewed', isViewed );
	}

	return (
		<Box sx={ { mt: 2, ...props.sx } } alignItems="top">
			<Alert severity="info" variant="standard" icon={ <BulbIcon sx={ { alignSelf: 'flex-start' } } /> } onClose={ markAsViewed }>
				{ __( 'Get improved results from AI by adding personal context.' ) }
				<Link onClick={ () => $e.route( 'panel/global/menu' ) } className="elementor-clickable" style={ { textDecoration: 'none' } } color="info.main" href="#">
					{ __( 'Let’s do it', 'elementor' ) }
				</Link>
			</Alert>
		</Box>
	);
};

VoicePromotionAlert.propTypes = {
	sx: PropTypes.object,
	introductionKey: PropTypes.string,
};

export default VoicePromotionAlert;
