import React from 'react';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import UnifyProductImages from './unify-product-images';
import PropTypes from 'prop-types';
import { AiLink, Icon } from '../gutenberg/styles';

const PRODUCT_ID_SEPARATOR = '-img_id-';

const extractImgIds = ( imageIdsStr ) => {
	const parts = imageIdsStr.split( PRODUCT_ID_SEPARATOR );

	return 2 === parts.length
		? { productId: parts[ 0 ], imageId: parts[ 1 ] }
		: { productId: imageIdsStr, imageId: null };
};

const UnifySingleProductImages = ( { productsImages, setProductImages, isProductGallery = false } ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const productsImagesDigested = productsImages.map( ( productImage, idx ) =>
		( { ...productImage, productId: `${ productImage.productId }${ PRODUCT_ID_SEPARATOR }${ productImage.id }`, sleepTime: ( idx ? idx + 10 : idx ) * 10 } ) );

	const handleButtonClick = () => {
		setIsOpen( true );
	};

	return (
		<div style={ { padding: '0.6em', float: 'right' } }>
			<Icon className={ 'eicon-ai' } />
			<AiLink onClick={ handleButtonClick }>{ __( 'Unify with Elementor AI', 'elementor' ) }</AiLink>
			{ isOpen && <UnifyProductImages
				productsImages={ productsImagesDigested }
				setProductImages={ async ( url, currentImageIdsStr, newImage ) => {
					setIsOpen( false );
					const { productId, imageId: currentImage } = extractImgIds( currentImageIdsStr );
					const product = productsImagesDigested.find( ( productImage ) => productImage.productId === currentImageIdsStr );
					await new Promise( ( resolve ) => setTimeout( resolve, product.sleepTime ) );
					setProductImages(
						url,
						productId,
						currentImage,
						newImage,
						isProductGallery,
					);
				} } /> }
		</div> );
};

UnifySingleProductImages.propTypes = {
	productsImages: PropTypes.arrayOf( PropTypes.object ),
	setProductImages: PropTypes.func,
	isProductGallery: PropTypes.bool,
};

export default UnifySingleProductImages;

