import { Button, withDirection } from '@elementor/ui';
import ChevronLeftIcon from '../../../icons/chevron-left-icon';

const StyledChevronLeftIcon = withDirection( ChevronLeftIcon );

const BackButton = ( { children, ...props } ) => {
	return (
		<Button
			size="small"
			variant="text"
			color="secondary"
			startIcon={ <StyledChevronLeftIcon /> }
			{ ...props }
		>
			{ children || __( 'Back', 'elementor' ) }
		</Button>
	);
};

BackButton.propTypes = {
	children: PropTypes.node,
};

export default BackButton;
