import { CircularProgress, Tooltip, Box, IconButton, withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import WandIcon from '../../../icons/wand-icon';

const StyledWandIcon = withDirection( WandIcon );

const EnhanceButton = ( { isLoading, ...props } ) => {
	return (
		<Tooltip title={ __( 'Enhance prompt', 'elementor' ) }>
			<Box component="span" sx={ { cursor: props.disabled ? 'default' : 'pointer' } }>
				<IconButton
					size="small"
					color="secondary"
					{ ...props }
				>
					{
						isLoading
							? <CircularProgress color="secondary" size={ 20 } />
							: <StyledWandIcon fontSize="small" />
					}
				</IconButton>
			</Box>
		</Tooltip>
	);
};

EnhanceButton.propTypes = {
	disabled: PropTypes.bool,
	isLoading: PropTypes.bool,
};

export default EnhanceButton;
