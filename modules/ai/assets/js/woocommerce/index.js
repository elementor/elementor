import React from 'react';
import { createRoot } from '@wordpress/element';
import { getUniqueId } from '../editor/context/requests-ids';
import UnifyProductImages from './unify-product-images';

( function( $ ) {
	'use strict';

	// Intercept the form submission for bulk actions
	$( '#bulk-action-selector-top, #bulk-action-selector-bottom' ).on( 'change', function() {
		const selectedAction = $( this ).val();
		if ( 'elementor-ai-unify-product-images' === selectedAction ) {
			// Intercept the apply button click
			$( '#doaction, #doaction2' ).on( 'click', function( e ) {
				try {
					e.preventDefault();

					// Collect the selected product IDs
					const postIds = [];
					$( 'input[name="post[]"]:checked' ).each( function() {
						postIds.push( $( this ).val() );
					} );

					if ( ! postIds.length ) {
						return;
					}

					$.post(
						window.UnifyProductImagesConfig.ajax_url,
						{
							action: selectedAction,
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
								root.render( <UnifyProductImages productImageUrls={ response.data.product_images } /> );
							}
						},
					);
				} finally {
					$( this ).off( 'click' );
				}
			} );
		}
	} );
} )( jQuery );

