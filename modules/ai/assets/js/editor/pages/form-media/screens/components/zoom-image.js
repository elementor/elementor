import { Stack, IconButton, Button, Box, withDirection } from '@elementor/ui';
import { IMAGE_ACTIONS } from '../../consts/consts';
import DownloadIcon from '../../../../icons/download-icon';
import EditIcon from '../../../../icons/edit-icon';
import ChevronRightIcon from '../../../../icons/chevron-right-icon';
import ChevronLeftIcon from '../../../../icons/chevron-left-icon';

const StyledChevronLeftIcon = withDirection( ChevronLeftIcon );
const StyledChevronRightIcon = withDirection( ChevronRightIcon );

const ZoomImage = (
	{
		images,
		zoomedImageIndex,
		imageNavigation,
		handleImageAction,
		viewData,
	},
) => {
	const currentImage = images[ zoomedImageIndex ];

	const { width, height } = viewData;

	return (
		<Stack alignItems="flex-start" spacing={ 2 }>
			<Stack direction="row" spacing={ 6 } alignSelf="center" alignItems="center">
				<IconButton onClick={ () => imageNavigation.navigatePrevImage() } size="large" color="secondary">
					<StyledChevronLeftIcon />
				</IconButton>

				<Stack spacing={ 2 } justifyContent="space-around" alignItems="center">
					<Box display="flex" width="100%" justifyContent="space-between" alignItems="center" sx={ { mb: 4 } }>
						<Button
							size="small"
							variant="text"
							color="secondary"
							startIcon={ <StyledChevronLeftIcon /> }
							onClick={ () => imageNavigation.backToResults() }
						>
							{ __( 'Back', 'elementor' ) }
						</Button>

						<Stack direction="row" spacing={ 3 } justifyContent="flex-end" width="100%">
							<Button
								size="small"
								color="secondary"
								startIcon={ <EditIcon /> }
								onClick={ () => handleImageAction( IMAGE_ACTIONS.REFERENCE, currentImage ) }
							>
								{ __( 'Edit', 'elementor' ) }
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
					>
						<img src={ currentImage.image_url } alt={ '' } style={ { width, height } } />
					</Box>
				</Stack>

				<IconButton onClick={ () => imageNavigation.navigateNextImage() } size="large" color="secondary">
					<StyledChevronRightIcon />
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
	viewData: PropTypes.object,
};

export default ZoomImage;
