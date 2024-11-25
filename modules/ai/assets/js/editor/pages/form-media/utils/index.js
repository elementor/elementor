import { IMAGE_ASPECT_RATIO } from '../constants';

export const getAspectRatioSizes = ( width, height ) => {
	const aspectRatios = Object.keys( IMAGE_ASPECT_RATIO );
	const targetRatio = width / height;
	let closestRatio = aspectRatios[ 0 ];
	let minDiff = Infinity;

	aspectRatios.forEach( ( ratio ) => {
		const [ w, h ] = ratio.split( ':' ).map( Number );
		const diff = Math.abs( targetRatio - ( w / h ) );

		if ( diff < minDiff ) {
			minDiff = diff;
			closestRatio = ratio;
		}
	} );

	return {
		ratio: closestRatio,
		...IMAGE_ASPECT_RATIO[ closestRatio ],
	};
};

export const fetchImageAsBase64 = async ( url ) => {
	try {
		const response = await fetch( url );
		const blob = await response.blob();
		const reader = new FileReader();

		return new Promise( ( resolve, reject ) => {
			reader.onloadend = () => {
				resolve( reader.result );
			};
			reader.onerror = reject;
			reader.readAsDataURL( blob );
		} );
	} catch ( error ) {
		throw error;
	}
};
