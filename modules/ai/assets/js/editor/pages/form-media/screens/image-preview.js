import { Box, Stack } from '@elementor/ui';

const ImagePreview = ( { editImage } ) => {
	return (
		<Stack alignItems="flex-start" spacing={ 2 } flexGrow={ 1 } sx={ { py: 9, overflowY: 'scroll' } }>
			<Stack direction="row" spacing={ 6 } alignSelf="center" alignItems="center">
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
				>
					<img src={ editImage.url } alt={ '' } style={ { maxWidth: '90%', maxHeight: '100%' } } />
				</Box>
			</Stack>
		</Stack>
	);
};

ImagePreview.propTypes = {
	editImage: PropTypes.object.isRequired,
};

export default ImagePreview;
