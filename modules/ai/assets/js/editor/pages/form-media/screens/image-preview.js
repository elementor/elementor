import { Box, Stack } from '@elementor/ui';

const ImagePreview = (
	{
		editImage,
	},
) => {
	return (
		<Stack alignItems="flex-start" spacing={ 2 } flexGrow={ 1 }>
			<Stack direction="row" spacing={ 6 } alignSelf="center" alignItems="center">
				<Stack spacing={ 2 } justifyContent="space-around" alignItems="center">
					<Box
						display="flex"
						justifyContent="center"
						alignItems="center"
						sx={ {
							bgcolor: 'secondary.background',
							width: 512,
							height: 512,
							overflow: 'hidden',
						} }
					>
						<img src={ editImage.url } alt={ '' } />
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

ImagePreview.propTypes = {
	editImage: PropTypes.object.isRequired,
};

export default ImagePreview;
