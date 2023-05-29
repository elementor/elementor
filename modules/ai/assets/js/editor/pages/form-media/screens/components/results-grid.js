import { Stack, Box, Button, IconButton, Typography, Tooltip } from '@elementor/ui';
import { IMAGE_ACTIONS } from '../../consts/consts';
import Overlay from '../../../../components/ui/overlay';
import OverlayBar from '../../../../components/ui/overlay-bar';
import ZoomInIcon from '../../../../icons/zoom-in-icon';
import VariationsIcon from '../../../../icons/variations-icon';
import DownloadIcon from '../../../../icons/download-icon';

const ResultsGrid = ( { images, handleImageAction } ) => {
	return (
		<>
			<Typography variant="h6" sx={ { mb: 4 } }>{ __( 'Generated Images', 'elementor' ) }</Typography>
			<Typography variant="body1" sx={ { mb: 7 } }>{ __( 'Place an image in your website or use it as a reference to generate similar images', 'elementor' ) }</Typography>

			<Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={ 7 }>
				{
					images.map( ( image, index ) => (
						<Box
							key={ `result-${ image.seed }` }
							display="flex"
							justifyContent="center"
							alignItems="center"
							sx={ {
								bgcolor: 'secondary.background',
								height: 336,
								position: 'relative',
							} }
						>
							<img
								src={ image.image_url }
								alt={ `generated-${ index }` }
								style={ { width: '100%', height: '100%' } }
							/>

							<Overlay>
								<OverlayBar position="bottom" direction="row" gap={ 3 } alignItems="center" justifyContent="space-between">
									<Button
										fullWidth
										variant="contained"
										startIcon={ <DownloadIcon /> }
										onClick={ () => handleImageAction( IMAGE_ACTIONS.USE, image ) }
									>
										{ __( 'Use Image', 'Elementor' ) }
									</Button>

									<Stack direction="row" gap={ 1 }>
										<Tooltip title={ __( 'Zoom', 'elementor' ) }>
											<IconButton
												color="secondary"
												sx={ { color: 'common.white', '&:hover': { color: 'common.white' } } }
												aria-label={ __( 'Zoom', 'elementor' ) }
												onClick={ () => handleImageAction( IMAGE_ACTIONS.ZOOM, index ) }
											>
												<ZoomInIcon />
											</IconButton>
										</Tooltip>

										<Tooltip title={ __( 'Use as Reference', 'elementor' ) }>
											<IconButton
												color="secondary"
												sx={ { color: 'common.white', '&:hover': { color: 'common.white' } } }
												aria-label={ __( 'Use as Reference', 'elementor' ) }
												onClick={ () => handleImageAction( IMAGE_ACTIONS.REFERENCE, image ) }
											>
												<VariationsIcon />
											</IconButton>
										</Tooltip>
									</Stack>
								</OverlayBar>
							</Overlay>
						</Box>
					) )
				}
			</Box>
		</>
	);
};

ResultsGrid.propTypes = {
	images: PropTypes.array,
	handleImageAction: PropTypes.func,
};

export default ResultsGrid;
