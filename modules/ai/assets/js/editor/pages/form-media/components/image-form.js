import { Box, Stack } from '@elementor/ui';
import PropTypes from 'prop-types';

const ImageForm = ( { children, ...props } ) => {
	return (
		<Box component="form" { ...props }>
			<Stack spacing={ 2.5 }>
				{ children }
			</Stack>
		</Box>
	);
};

ImageForm.propTypes = {
	children: PropTypes.node,
};

export default ImageForm;
