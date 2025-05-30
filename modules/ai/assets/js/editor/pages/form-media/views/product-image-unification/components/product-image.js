import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import useProductImageUnification from '../hooks/use-product-image-unification';
import { IMAGE_BACKGROUND_COLOR, IMAGE_RATIO } from '../../../hooks/use-prompt-settings';
import useImageActions from '../../../hooks/use-image-actions';

const ProductImage = ( { productId, ratio, bgColor, image, onUpdate } ) => {
	const { isLoading: isUploading } = useImageActions();
	const { data, isLoading: isGenerating, error, send, sendUsageData } = useProductImageUnification( {
		productId,
		[ IMAGE_RATIO ]: ratio,
		[ IMAGE_BACKGROUND_COLOR ]: bgColor,
		image } );

	useEffect( () => {
		if ( onUpdate ) {
			onUpdate( data, isGenerating || isUploading, error, send, productId, ratio, bgColor, image, sendUsageData );
		}
	}, [ data, isGenerating, error, send, productId, ratio, bgColor, image, isUploading, onUpdate, sendUsageData ] );

	return <div style={ { visibility: 'hidden' } }></div>;
};

ProductImage.propTypes = {
	productId: PropTypes.number,
	ratio: PropTypes.string,
	bgColor: PropTypes.string,
	image: PropTypes.object,
	onUpdate: PropTypes.func,
};

export default ProductImage;
