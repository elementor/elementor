import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import PropTypes from 'prop-types';

export const DefaultPanelLayout = ( { description, children } ) => {
	return (
		<Stack spacing={ 1 } px={ 6 } py={ 3 }>
			<Typography variant="subtitle1">{ description }</Typography>
			{ children }
		</Stack>
	);
};

DefaultPanelLayout.propTypes = {
	description: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};
