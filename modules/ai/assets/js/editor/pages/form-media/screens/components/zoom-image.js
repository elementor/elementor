import { Stack, IconButton, Button, Box } from '@elementor/ui';
import { IMAGE_ACTIONS } from '../../consts/consts';
import ChevronLeftIcon from '../../../../icons/chevron-left-icon';
import ChevronRightIcon from '../../../../icons/chevron-right-icon';
import DownloadIcon from '../../../../icons/download-icon';
import VariationsIcon from '../../../../icons/variations-icon';

const ZoomImage = (
	{
		images,
		zoomedImageIndex,
		imageNavigation,
		handleImageAction,
	},
) => {
	const currentImage = images[ zoomedImageIndex ];

	return (
		<Stack alignItems="flex-start" spacing={ 2 }>
			<Stack direction="row" spacing={ 6 } alignSelf="center" alignItems="center">
				<IconButton onClick={ () => imageNavigation.navigatePrevImage() } size="large" color="secondary">
					<ChevronLeftIcon />
				</IconButton>

				<Stack spacing={ 2 } justifyContent="space-around" alignItems="center">
					<Box display="flex" width="100%" justifyContent="space-between" alignItems="center" sx={ { mb: 4 } }>
						<Button
							size="small"
							variant="text"
							color="secondary"
							startIcon={ <ChevronLeftIcon /> }
							onClick={ () => imageNavigation.backToResults() }
						>
							{ __( 'Back', 'elementor' ) }
						</Button>

						<Stack direction="row" spacing={ 3 } justifyContent="flex-end" width="100%">
							<Button
								size="small"
								color="secondary"
								startIcon={ <VariationsIcon /> }
								onClick={ () => handleImageAction( IMAGE_ACTIONS.REFERENCE, currentImage ) }
							>
								{ __( 'Use as Reference', 'elementor' ) }
							</Button>

							<Button
								size="small"
								variant="contained"
								startIcon={ <DownloadIcon /> }
								onClick={ () => handleImageAction( IMAGE_ACTIONS.USE, currentImage ) }
							>
								{ __( 'Use Image', 'elementor' ) }
							</Button>
						</Stack>
					</Box>

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
						<img src={ currentImage.image_url } alt={ '' } />
					</Box>
				</Stack>

				<IconButton onClick={ () => imageNavigation.navigateNextImage() } size="large" color="secondary">
					<ChevronRightIcon />
				</IconButton>
			</Stack>
		</Stack>
	);
};

ZoomImage.propTypes = {
	images: PropTypes.array,
	zoomedImageIndex: PropTypes.number,
	handleImageAction: PropTypes.func,
	imageNavigation: PropTypes.object,
};

export default ZoomImage;
