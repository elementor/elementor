import { useState, useMemo, useEffect } from 'react';
import useImagesPreload from '../../../../../hooks/use-images-preload';

const shuffleImages = ( images ) => {
	return images
		.map( ( image ) => [ Math.random(), image ] )
		.sort( ( [ a ], [ b ] ) => a - b )
		.map( ( [ , image ] ) => image );
};

const useSuggestedImages = ( { selectedType } ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ data, setImagesState ] = useState( { images: [] } );
	const { ready, preloadImages } = useImagesPreload();

	const imagesData = useMemo( () => {
		const shuffledImages = shuffleImages( data.images );

		if ( ! selectedType ) {
			return shuffledImages;
		}

		const categoryImages = shuffledImages.filter( ( { imageType } ) => imageType.includes( selectedType ) );

		// Some categories don't have images, so we TEMPORARILY fallback to the shuffled images.
		return categoryImages.length ? categoryImages : shuffledImages;
	}, [ selectedType, data ] );

	const fetchImages = () => {
		setIsLoading( true );

		fetch( 'https://my.elementor.com/ai/images-prompt-gallery/ai-gallery.json' )
			.then( ( response ) => response.json() )
			.then( ( json ) => setImagesState( json ) )
			// eslint-disable-next-line no-console
			.catch( ( e ) => console.log( e.message ) )
			.finally( () => setIsLoading( false ) );
	};

	useEffect( () => {
		if ( 0 === data?.images.length ) {
			fetchImages();
			return;
		}

		preloadImages( data.images.map( ( { thumbnailUrl } ) => thumbnailUrl ) );
	}, [ data ] );

	return {
		imagesData,
		isLoading: ! ready || isLoading,
	};
};

export default useSuggestedImages;
