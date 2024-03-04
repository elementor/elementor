import React from 'react';
import { Box, Alert, Link, styled } from '@elementor/ui';
import BulbIcon from '../icons/bulb-icon';
import useIntroduction from '../hooks/use-introduction';

const StyledLink = styled( Link )( ( { theme } ) => ( {
	color: theme.palette.info.main,
	underline: 'none',
	pl: '2',
} ) );

export const VoicePromotionAlert = ( props ) => {
	const { isViewed, markAsViewed } = useIntroduction( props.introductionKey );

	return (
		! isViewed
			?			<Box sx={ { my: 2, ...props.sx } }>
				<Alert severity="info" variant="standard" icon={ <BulbIcon /> } onClose={ markAsViewed } sx={ { alignItems: 'center' } }
				>
					{ `Get improved results from AI by adding some personal context. Go to Site Settings > AI Context to get started` }
					<StyledLink onClick={ markAsViewed }>Got it</StyledLink>
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
