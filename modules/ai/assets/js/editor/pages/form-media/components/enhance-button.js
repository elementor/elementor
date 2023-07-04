import { CircularProgress, Tooltip, Box, IconButton, withDirection } from '@elementor/ui';
import WandIcon from '../../../icons/wand-icon';

const StyledWandIcon = withDirection( WandIcon );

const EnhanceButton = ( { isLoading, ...props } ) => {
	if ( isLoading ) {
		return <CircularProgress color="secondary" size={ 20 } sx={ { mr: 2 } } />;
	}

	return (
		<Tooltip title={ __( 'Enhance prompt', 'elementor' ) }>
			<Box component="span" sx={ { cursor: 'pointer' } }>
				<IconButton
					size="small"
					color="secondary"
					{ ...props }
				>
					<StyledWandIcon />
				</IconButton>
			</Box>
		</Tooltip>
	);
};

EnhanceButton.propTypes = {
	isLoading: PropTypes.bool,
};

export default EnhanceButton;
