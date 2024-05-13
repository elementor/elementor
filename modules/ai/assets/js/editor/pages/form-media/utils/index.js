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
