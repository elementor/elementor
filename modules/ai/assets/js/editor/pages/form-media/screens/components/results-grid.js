import { Stack, Box, Button, IconButton, Tooltip } from '@elementor/ui';
import { IMAGE_ACTIONS } from '../../consts/consts';
import Overlay from '../../../../components/ui/overlay';
import OverlayBar from '../../../../components/ui/overlay-bar';
import ZoomInIcon from '../../../../icons/zoom-in-icon';
import EditIcon from '../../../../icons/edit-icon';
import DownloadIcon from '../../../../icons/download-icon';

const ResultsGrid = ( { images, handleImageAction, aspectRatio } ) => {
	// TODO: temp solution for displaying the resized image result.
	if ( 1 === images.length ) {
		const image = images[ 0 ];

		return (
			<Box>
				<Stack spacing={ 2 } justifyContent="space-around" alignItems="center">
					<Box display="flex" width="100%" justifyContent="flex-end" alignItems="center" sx={ { mb: 4 } }>
						<Stack direction="row" spacing={ 3 } justifyContent="flex-end" width="100%">
							<Button
								size="small"
								color="secondary"
								startIcon={ <EditIcon /> }
								onClick={ () => handleImageAction( IMAGE_ACTIONS.REFERENCE, image ) }
							>
								{ __( 'Edit', 'elementor' ) }
							</Button>

							<Button
								size="small"
								variant="contained"
								startIcon={ <DownloadIcon /> }
								onClick={ () => handleImageAction( IMAGE_ACTIONS.USE, image ) }
							>
								{ __( 'Use Image', 'elementor' ) }
							</Button>
						</Stack>
					</Box>
				</Stack>

				<Box display="flex" justifyContent="center">
					<img
						src={ image.image_url }
						alt={ `generated--resized` }
						style={ { maxWidth: '100%', width: 'auto', maxHeight: '100%' } }
					/>
				</Box>
			</Box>
		);
	}

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

									<Tooltip title={ __( 'Edit', 'elementor' ) }>
										<IconButton
											color="secondary"
											sx={ { color: 'common.white', '&:hover': { color: 'common.white' } } }
											aria-label={ __( 'Edit', 'elementor' ) }
											onClick={ () => handleImageAction( IMAGE_ACTIONS.REFERENCE, image ) }
										>
											<EditIcon />
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
