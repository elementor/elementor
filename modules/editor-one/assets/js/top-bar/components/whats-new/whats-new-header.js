import { Typography } from '@elementor/ui';
import XIcon from '@elementor/icons/XIcon';
import PropTypes from 'prop-types';
import { CloseButton, HeaderContainer } from './styled-components';

const WhatsNewHeader = ( { onClose } ) => {
	return (
		<HeaderContainer>
			<Typography variant="h6">
				{ __( "What's New", 'elementor' ) }
			</Typography>
			<CloseButton onClick={ onClose } size="small">
				<XIcon />
			</CloseButton>
		</HeaderContainer>
	);
};

WhatsNewHeader.propTypes = {
	onClose: PropTypes.func.isRequired,
};

export default WhatsNewHeader;

