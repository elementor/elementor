import { Box, IconButton, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { XIcon } from '@elementor/icons';

const StyledContent = styled( Box )( ( { theme } ) => ( {
	marginTop: 0,
	padding: theme.spacing( 1.5 ),
	borderBottom: `1px solid ${ theme.palette.action.focus }`,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
} ) );

const PromptHistoryModalHeader = ( { onClose } ) => {
	return (
		<StyledContent>
			<Typography fontWeight="bolder" variant="h6" sx={ { userSelect: 'none' } }>
				{ __( 'History', 'elementor' ) }
			</Typography>

			<IconButton
				size="small"
				aria-label={ __( 'Hide prompt history', 'elementor' ) }
				onClick={ onClose }>
				<XIcon fontSize="small" />
			</IconButton>
		</StyledContent>
	);
};

PromptHistoryModalHeader.propTypes = {
	onClose: PropTypes.func.isRequired,
};

export default PromptHistoryModalHeader;
