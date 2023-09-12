import { Box, Stack } from '@elementor/ui';

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
