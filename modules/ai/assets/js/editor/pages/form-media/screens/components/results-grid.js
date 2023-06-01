import { Stack, Box, Button, IconButton, Tooltip } from '@elementor/ui';
import { IMAGE_ACTIONS } from '../../consts/consts';
import Overlay from '../../../../components/ui/overlay';
import OverlayBar from '../../../../components/ui/overlay-bar';
import ZoomInIcon from '../../../../icons/zoom-in-icon';
import VariationsIcon from '../../../../icons/variations-icon';
import DownloadIcon from '../../../../icons/download-icon';

const ResultsGrid = ( { images, handleImageAction, aspectRatio } ) => {
	return (
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
							overflow: 'hidden',
						} }
					>
						<img
							src={ image.image_url }
							alt={ `generated-${ index }` }
							style={ {
								width: 'auto',
								height: 'auto',
								maxWidth: '100%',
								maxHeight: '1:1' === aspectRatio ? 'initial' : '100%',
								objectFit: 'contain',
								aspectRatio: aspectRatio.replace( ':', ' / ' ),
							} }
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
	);
};

ResultsGrid.propTypes = {
	images: PropTypes.array,
	handleImageAction: PropTypes.func,
	aspectRatio: PropTypes.string,
};

export default ResultsGrid;
