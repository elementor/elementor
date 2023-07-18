import { useState } from 'react';

const useImagesPreload = ( property = 'url' ) => {
	const [ imagesPreloaded, setImagesPreLoaded ] = useState( false );

	const preloadImages = ( images ) => {
		setImagesPreLoaded( false );

		const loadImage = ( image ) => {
			return new Promise( ( resolve, reject ) => {
				const loadImg = new Image();

				loadImg.src = image[ property ];

				loadImg.onload = () => resolve( image[ property ] );

				loadImg.onerror = ( err ) => reject( err );
			} );
		};

		Promise.all( images.map( ( image ) => loadImage( image ) ) )
			.then( () => setImagesPreLoaded( true ) )
			.catch( ( err ) => console.log( 'Failed to load images', err ) ); // Todo error better handling
	};

	return {
		imagesPreloaded,
		preloadImages,
	};
};

export default useImagesPreload;
