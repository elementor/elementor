import { Box, Stack } from '@elementor/ui';
import useImageSize from '../hooks/use-image-size';
import useImageNavigation from '../../../hooks/use-image-navigation';
import ImageSlider from './image-slider';
import ImageActions from './image-actions';
import Gallery from './gallery';
import BackButton from './back-button';
import SingleImagePreview from './single-image-preview';

const Container = ( { children, sx = {}, ...props } ) => (
	<Box flexGrow={ 1 } { ...props } sx={ { overflowY: 'scroll', ...sx } }>{ children }</Box>
);

Container.propTypes = {
	sx: PropTypes.object,
	children: PropTypes.node,
};

const ImagesDisplay = ( {
	images,
	aspectRatio,
	onUseImage,
	onEditImage,
} ) => {
	const { zoomIndex, setZoomIndex, actions } = useImageNavigation( images );

	const { width, height } = useImageSize( aspectRatio );

	if ( zoomIndex > -1 ) {
		const currentImage = images[ zoomIndex ];

		return (
			<Container>
				<ImageSlider
					onPrev={ actions.prev }
					onNext={ actions.next }
				>
					<ImageSlider.Actions startAction={ <BackButton onClick={ actions.reset } /> }>
						<ImageActions.EditImage onClick={ () => onEditImage( currentImage ) } />
						<ImageActions.UseImage onClick={ () => onUseImage( currentImage ) } />
					</ImageSlider.Actions>

					<ImageSlider.Image src={ currentImage.image_url } style={ { maxWidth: '630px', width: '100%', height: 'auto' } } />
				</ImageSlider>
			</Container>
		);
	}

	if ( 1 === images.length ) {
		const image = images[ 0 ];

		return (
			<Container flexDirection="column">
				<SingleImagePreview>
					<SingleImagePreview.Image src={ image.image_url || image.url } style={ { width, height } } alt="generated-image">
						<SingleImagePreview.Actions>
							<ImageActions.EditImage onClick={ () => onEditImage( image ) } />
							<ImageActions.UseImage onClick={ () => onUseImage( image ) } />
						</SingleImagePreview.Actions>
					</SingleImagePreview.Image>
				</SingleImagePreview>
			</Container>
		);
	}

	return (
		<Container>
			<Gallery>
				{
					images.map( ( image, index ) => (
						<Gallery.Image
							key={ `result-${ image.seed }` }
							alt={ `generated-${ index }` }
							src={ image.image_url }
							aspectRatio={ aspectRatio }
						>
							<ImageActions>
								<ImageActions.UseImage onClick={ () => onUseImage( image ) } size="medium" fullWidth />

								<Stack direction="row" spacing={ 1 } alignItems="center">
									<ImageActions.ZoomIcon onClick={ () => setZoomIndex( index ) } size="medium" />
									<ImageActions.EditIcon onClick={ () => onEditImage( image ) } size="medium" />
								</Stack>
							</ImageActions>
						</Gallery.Image>
					) )
				}
			</Gallery>
		</Container>
	);
};

ImagesDisplay.propTypes = {
	images: PropTypes.array,
	aspectRatio: PropTypes.string,
	onUseImage: PropTypes.func,
	onEditImage: PropTypes.func,
};

ImagesDisplay.Container = Container;

export default ImagesDisplay;
