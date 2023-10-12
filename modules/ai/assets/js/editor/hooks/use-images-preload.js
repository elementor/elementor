import { useState } from 'react';

const loadImage = ( url ) => {
	return new Promise( ( resolve, reject ) => {
		const loadImg = new Image();

		loadImg.src = url;

		loadImg.onload = () => resolve( url );

		loadImg.onerror = ( err ) => reject( err );
	} );
};

const useImagesPreload = () => {
	const [ ready, setReady ] = useState( false );

	const preloadImages = ( images ) => {
		setReady( false );

		Promise.all( images.map( ( url ) => loadImage( url ) ) )
			.then( () => setReady( true ) )
			// eslint-disable-next-line no-console
			.catch( ( err ) => console.log( 'Failed to load images', err ) ); // Todo error better handling
	};

	return {
		ready,
		preloadImages,
	};
};

export default useImagesPreload;
