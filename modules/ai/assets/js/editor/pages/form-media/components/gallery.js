import { Box, Checkbox, ImageList, ImageListItem, Skeleton } from '@elementor/ui';
import PropTypes from 'prop-types';
import Overlay from '../../../components/ui/overlay';
import OverlayBar from '../../../components/ui/overlay-bar';
import OverlayBarText from '../../../components/ui/overlay-bar-text';
import { IMAGE_ASPECT_RATIO } from '../constants';
import { useEffect, useState } from 'react';

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
	numImagesInRow = 2,
	overlay = true,
	onSelectChange = null,
	checkboxColor = 'rgba(0, 0, 0, 0.54)',
	isLoading = false,
	initialChecked = false,
	...props
} ) => {
	const [ isChecked, setIsChecked ] = useState( initialChecked );
	const style = {};
	const isRTL = elementorCommon?.config?.isRTL ?? true;

	useEffect( () => {
		setIsChecked( initialChecked );
	}, [ initialChecked ] );

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
					bgcolor: 'action.selected',
					height: 'contained' === variant && numImagesInRow <= 2 ? 336 : 'auto',
					position: 'relative',
					overflow: 'hidden',
				} }
			>
				<>
					{ isLoading
						? <Skeleton sx={ { ...style, width: '100%', height: '100% ' } } animation={ 'wave' } variant={ 'rounded' }>
							<img alt={ alt } src={ src } style={ { ...style, visibility: 'hidden' } } />
						</Skeleton>
						: ( <>
							{ onSelectChange &&
								<Checkbox
									onClick={ () => {
										const newVal = ! isChecked;
										setIsChecked( newVal );
										onSelectChange( newVal );
									} }
									checked={ isChecked }
									sx={ {
										position: 'absolute',
										top: 0,
										left: isRTL ? undefined : 0,
										right: isRTL ? 0 : undefined,
										'& .MuiSvgIcon-root': {
											color: checkboxColor,
										} } } /> }
							<img alt={ alt } src={ src } style={ style } />
						</> )
					}
				</>
			</Box>

			{ overlay && children && (
				<Overlay>
					<OverlayBar gap={ 1 } position="bottom" { ...OverlayBarProps }>
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
	numImagesInRow: PropTypes.number,
	overlay: PropTypes.bool,
	onSelectChange: PropTypes.func,
	checkboxColor: PropTypes.string,
	initialChecked: PropTypes.bool,
	isLoading: PropTypes.bool,
};

Gallery.Image = GalleryImage;

export default Gallery;
