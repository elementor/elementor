import { ImageList, ImageListItem, Box } from '@elementor/ui';
import Overlay from '../../../components/ui/overlay';
import OverlayBar from '../../../components/ui/overlay-bar';
import OverlayBarText from '../../../components/ui/overlay-bar-text';
import { IMAGE_ASPECT_RATIO } from '../constants';

const aspectRatios = Object.keys( IMAGE_ASPECT_RATIO );

const Gallery = ( { children, ...props } ) => {
	return (
		<ImageList width="100%" cols={ 2 } gap={ 24 } { ...props }>
			{ children }
		</ImageList>
	);
};

Gallery.propTypes = {
	children: PropTypes.node,
};

const GalleryImage = ( {
	alt,
	src,
	text,
	children,
	aspectRatio = '1:1',
	variant = 'contained',
	OverlayBarProps = {},
	...props
} ) => {
	const style = {};

	if ( 'thumbnail' === variant ) {
		style.width = '100%';
		style.maxHeight = '238px';
		style.minWidth = '230px';
	} else {
		style.width = 'auto';
		style.height = 'auto';
		style.maxWidth = '100%';
		style.maxHeight = '1:1' === aspectRatio ? 'initial' : '100%';
		style.objectFit = 'contain';
		style.aspectRatio = aspectRatio.replace( ':', ' / ' );
	}

	return (
		<ImageListItem { ...props }>
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				sx={ {
					bgcolor: 'secondary.background',
					height: 'contained' === variant ? 336 : 'auto',
					position: 'relative',
					overflow: 'hidden',
				} }
			>
				<img alt={ alt } src={ src } style={ style } />
			</Box>

			{ children && (
				<Overlay>
					<OverlayBar gap={ 3 } position="bottom" { ...OverlayBarProps }>
						{ text && <OverlayBarText>{ text }</OverlayBarText> }

						{ children }
					</OverlayBar>
				</Overlay>
			) }
		</ImageListItem>
	);
};

GalleryImage.propTypes = {
	alt: PropTypes.string,
	src: PropTypes.string,
	text: PropTypes.string,
	children: PropTypes.node,
	BoxProps: PropTypes.object,
	OverlayBarProps: PropTypes.object,
	aspectRatio: PropTypes.oneOf( aspectRatios ),
	variant: PropTypes.oneOf( [ 'contained', 'thumbnail' ] ),
};

Gallery.Image = GalleryImage;

export default Gallery;
