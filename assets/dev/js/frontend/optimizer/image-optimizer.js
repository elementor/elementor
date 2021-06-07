import Compressor from 'compressorjs';

/** Class representing a dedicated Image Optimizer for elementor analyzer data. */
export default class ImageOptimizer {
	static optimizeImages;
	async imgToBlob( img ) {
		return fetch( img ).then( function( response ) {
			return response.blob();
		} );
	}

	optimizeImages( images, placeholders ) {
		const possibleSizes = placeholders ?
			[ 256, 192, 128, 64, 32 ] :
			[ 1600, 1280, 1024, 768, 512, 256, 128, 64, 32 ];

		const promises = images.map( ( image ) => {
			const src = image.src ? image.src : image.url;
			const sizeDeltaThreshold = placeholders ? 0.333 : 1.5;
			const maxWidth = possibleSizes.reduce( ( prev, curr ) => {
				const goal = sizeDeltaThreshold * image.clientWidth;
				return ( Math.abs( curr - goal ) < Math.abs( prev - goal ) ? curr : prev );
			} );

			return this.imgToBlob( src ).then( ( blob ) => {
				return new Promise( ( resolve, reject ) => {
					new Compressor( blob, {
						quality: placeholders ? 0.4 : 0.75,
						maxWidth: maxWidth,
						maxHeight: maxWidth * 3,
						mimeType: 'image/webp',
						success( result ) {
							const reader = new FileReader();
							reader.onload = ( e ) => {
								const imgData = {};
								imgData.data = e.target.result;
								imgData.size = Math.min( maxWidth, image.naturalWidth );
								image[ placeholders ? 'placeholder' : 'optimized' ] = imgData;
								resolve();
							};
							reader.readAsDataURL( result );
						},
					} );
				} );
			} );
		} );

		return Promise.all( promises );
	}
}
