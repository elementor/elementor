import React from 'react';
import { createRoot } from '@wordpress/element';
import { getUniqueId } from '../editor/context/requests-ids';
import UnifyProductImages from './unify-product-images';

( function( $ ) {
	'use strict';

	$( '#bulk-action-selector-top, #bulk-action-selector-bottom' ).on( 'change', function() {
		const selectedAction = $( this ).val();
		if ( 'elementor-ai-unify-product-images' === selectedAction ) {
			window.ElementorAiConfig.is_get_started = window.UnifyProductImagesConfig.is_get_started;
			window.ElementorAiConfig.connect_url = window.UnifyProductImagesConfig.connect_url;

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

					async function setProductImages( url, productId ) {
						$.post(
							window.UnifyProductImagesConfig.set_product_images_url,
							{
								action: 'elementor-ai-set-product-images',
								nonce: window.UnifyProductImagesConfig.nonce,
								productId,
								image_url: url,
							},
							function( response ) {
								if ( response.success && response.data.refresh ) {
									location.reload();
								}
							},
						);
					}

					$.post(
						window.UnifyProductImagesConfig.get_product_images_url,
						{
							action: 'elementor-ai-get-product-images',
							nonce: window.UnifyProductImagesConfig.nonce,
							post_ids: postIds,
						},
						function( response ) {
							if ( response.success && response.data.product_images ) {
								window.EDITOR_SESSION_ID = getUniqueId( 'woocommerce-unify-product-images' );
								const container = document.createElement( 'div' );
								const wpContentContainer = document.querySelector( '#wpbody-content' );
								container.id = 'e-ai-woocommerce-unify-product-images';
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
} )( jQuery );

