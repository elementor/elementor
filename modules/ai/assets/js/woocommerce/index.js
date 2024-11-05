import React from 'react';
import { createRoot } from '@wordpress/element';
import { getUniqueId } from '../editor/context/requests-ids';
import UnifyProductImages from './unify-product-images';
import UnifySingleProductImages from './unify-single-product-images';

( async function( $ ) {
	'use strict';

	async function setProductImages( url, productId, currentImage = null, newImage = null, isProductGallery = false ) {
		$.post(
			window.UnifyProductImagesConfig.set_product_images_url,
			{
				action: 'elementor-ai-set-product-images',
				nonce: window.UnifyProductImagesConfig.nonce,
				productId,
				image_url: url,
				image_to_add: newImage,
				image_to_remove: currentImage,
				is_product_gallery: isProductGallery,
			},
			function( response ) {
				if ( response.success && response.data.refresh ) {
					location.reload();
				}
			},
		);
	}

	function setConfig() {
		window.ElementorAiConfig = window.ElementorAiConfig ?? {};
		window.ElementorAiConfig.is_get_started = window.UnifyProductImagesConfig.is_get_started;
		window.ElementorAiConfig.connect_url = window.UnifyProductImagesConfig.connect_url;
	}

	$( '#bulk-action-selector-top, #bulk-action-selector-bottom' ).on( 'change', function() {
		const selectedAction = $( this ).val();
		if ( 'elementor-ai-unify-product-images' === selectedAction ) {
			setConfig();

			$( '#doaction, #doaction2' ).on( 'click', function( e ) {
				try {
					e.preventDefault();

					const postIds = [];
					$( 'input[name="post[]"]:checked' ).each( function() {
						postIds.push( $( this ).val() );
					} );

					if ( ! postIds.length ) {
						return;
					}

					$.post(
						window.UnifyProductImagesConfig.get_product_images_url,
						{
							action: 'elementor-ai-get-product-images',
							nonce: window.UnifyProductImagesConfig.nonce,
							post_ids: postIds,
						},
						function( response ) {
							if ( response.success && response.data?.product_images?.length ) {
								window.EDITOR_SESSION_ID = getUniqueId( 'woocommerce-unify-product-images' );
								const container = document.createElement( 'div' );
								container.id = 'e-ai-woocommerce-unify-product-images';
								const wpContentContainer = document.querySelector( '#wpbody-content' );
								wpContentContainer.appendChild( container );
								const root = createRoot( container );
								root.render( <UnifyProductImages productsImages={ response.data.product_images } setProductImages={ setProductImages } /> );
							}
						},
					);
				} catch ( _ ) {
					$( this ).off( 'click' );
				}
			} );
		}
	} );

	const productThumbnail = $( '#postimagediv > .inside' );

	if ( productThumbnail.length ) {
		setConfig();

		const urlParams = new URLSearchParams( window.location.search );
		const postId = urlParams.get( 'post' );

		const response = await $.post( window.UnifyProductImagesConfig.get_product_images_url,
			{
				action: 'elementor-ai-get-product-images',
				nonce: window.UnifyProductImagesConfig.nonce,
				post_ids: [ postId ],
			} );

		if ( response.success && response.data?.product_images?.length ) {
			window.EDITOR_SESSION_ID = getUniqueId( 'woocommerce-unify-single-product-image' );
			const container = document.createElement( 'div' );
			container.id = 'e-ai-woocommerce-unify-single-product-image';
			container.style.width = '100%';
			container.style.height = 'auto';
			container.style.overflow = 'hidden';
			const wpContentContainer = productThumbnail[ 0 ];
			wpContentContainer.insertBefore( container, wpContentContainer.firstChild );
			const root = createRoot( container );
			root.render( <UnifySingleProductImages productsImages={ response.data.product_images } setProductImages={ setProductImages } /> );
		}
	}

	const productGallery = $( '#woocommerce-product-images > .inside' );
	if ( productGallery.length ) {
		setConfig();

		const urlParams = new URLSearchParams( window.location.search );
		const postId = urlParams.get( 'post' );

		const response = await $.post(
			window.UnifyProductImagesConfig.get_product_images_url,
			{
				action: 'elementor-ai-get-product-images',
				nonce: window.UnifyProductImagesConfig.nonce,
				post_ids: [ postId ],
				is_galley_only: true,
			} );

		if ( response.success && response.data?.product_images?.length ) {
			window.EDITOR_SESSION_ID = getUniqueId( 'woocommerce-unify-single-product-images' );
			const container = document.createElement( 'div' );
			container.id = 'e-ai-woocommerce-unify-single-product-images';
			container.style.width = '100%';
			container.style.height = 'auto';
			container.style.overflow = 'hidden';
			const wpContentContainer = productGallery[ 0 ];
			wpContentContainer.insertBefore( container, wpContentContainer.firstChild );
			const root = createRoot( container );
			root.render( <UnifySingleProductImages productsImages={ response.data.product_images } setProductImages={ setProductImages } isProductGallery /> );
		}
	}
} )( jQuery );

