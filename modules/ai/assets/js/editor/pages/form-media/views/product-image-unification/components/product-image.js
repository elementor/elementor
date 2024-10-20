import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import useProductImageUnification from '../hooks/use-product-image-unification';
import { IMAGE_BACKGROUND_COLOR, IMAGE_RATIO } from '../../../hooks/use-prompt-settings';

const ProductImage = ( { productId, ratio, bgColor, image, onUpdate } ) => {
	const { data, isLoading, error, send } = useProductImageUnification( {
		productId,
		[ IMAGE_RATIO ]: ratio,
		[ IMAGE_BACKGROUND_COLOR ]: bgColor,
		image } );

	useEffect( () => {
		if ( onUpdate ) {
			onUpdate( data, isLoading, error, send, productId, ratio, bgColor, image );
		}
	}, [ data, isLoading, error, send, productId, ratio, bgColor, image, onUpdate ] );

	return <div style={ { visibility: 'hidden' } }></div>;
};

ProductImage.propTypes = {
	productId: PropTypes.string,
	ratio: PropTypes.number,
	bgColor: PropTypes.string,
	image: PropTypes.object,
	onUpdate: PropTypes.func,
};

export default ProductImage;
