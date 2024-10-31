import { Box, Stack } from '@elementor/ui';
import PropTypes from 'prop-types';
import useImageSize from '../hooks/use-image-size';
import useImageNavigation from '../../../hooks/use-image-navigation';
import ImageSlider from './image-slider';
import ImageActions from './image-actions';
import Gallery from './gallery';
import BackButton from './back-button';
import SingleImagePreview from './single-image-preview';

const Container = ( { children, sx = {}, ...props } ) => (
	<Box flexGrow={ 1 } { ...props } sx={ { overflowY: 'auto', ...sx } }>{ children }</Box>
);

Container.propTypes = {
	sx: PropTypes.object,
	children: PropTypes.node,
};

const ImagesDisplay = ( {
	images,
	aspectRatio = '1:1',
	onUseImage = null,
	onEditImage = null,
	transparentContainer = false,
	cols = 2,
	overlay = true,
	onSelectChange = null,
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
						{ onEditImage && <ImageActions.EditImage onClick={ () => onEditImage( currentImage ) } /> }
						{ onUseImage && <ImageActions.UseImage onClick={ () => onUseImage( currentImage ) } /> }
					</ImageSlider.Actions>

					<ImageSlider.Image src={ currentImage.image_url } style={ { maxWidth: '630px', width: '100%', height: 'auto' } } />
				</ImageSlider>
			</Container>
		);
	}

	if ( 1 === images.length ) {
		const image = images[ 0 ];
		const singleImageStyle = { width, height };
		if ( transparentContainer ) {
			singleImageStyle.backgroundImage = 'linear-gradient(45deg, #bbb 25%, transparent 25%), linear-gradient(-45deg, #bbb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #bbb 75%), linear-gradient(-45deg, transparent 75%, #bbb 75%)';
			singleImageStyle.backgroundSize = '20px 20px';
			singleImageStyle.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
		}
		return (
			<Container flexDirection="column">
				<SingleImagePreview>
					<SingleImagePreview.Image src={ image.image_url || image.url } style={ singleImageStyle } alt="generated-image" isLoading={ image.isLoading }>
						<SingleImagePreview.Actions>
							{ onEditImage && <ImageActions.EditImage onClick={ () => onEditImage( image ) } /> }
							{ onUseImage && <ImageActions.UseImage onClick={ () => onUseImage( image ) } /> }
						</SingleImagePreview.Actions>
					</SingleImagePreview.Image>
				</SingleImagePreview>
			</Container>
		);
	}

	return (
		<Container>
			<Gallery cols={ cols }>
				{
					images.map( ( image, index ) => (
						<Gallery.Image
							key={ `result-${ image.seed }` }
							alt={ `generated-${ index }` }
							src={ image.image_url }
							aspectRatio={ aspectRatio }
							data-testid="e-gallery-image"
							numImagesInRow={ cols }
							overlay={ overlay }
							onSelectChange={ onSelectChange ? ( isChecked ) => onSelectChange( image.productId, isChecked ) : null }
							checkboxColor={ image.checkboxColor }
							isLoading={ image.isLoading }
						>
							<ImageActions>
								{ onUseImage && <ImageActions.UseImage onClick={ () => onUseImage( image ) } size="medium"
									fullWidth /> }

								<Stack direction="row" spacing={ 0.25 } alignItems="center">
									<ImageActions.ZoomIcon onClick={ () => setZoomIndex( index ) } size="medium" />
									{ onEditImage && <ImageActions.EditIcon onClick={ () => onEditImage( image ) } size="medium" /> }
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
	transparentContainer: PropTypes.bool,
	cols: PropTypes.number,
	overlay: PropTypes.bool,
	onSelectChange: PropTypes.func,
};

ImagesDisplay.Container = Container;

export default ImagesDisplay;
