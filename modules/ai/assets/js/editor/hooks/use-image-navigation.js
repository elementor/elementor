import { useState } from 'react';

const initialIndex = -1;

const useImageNavigation = ( images ) => {
	const [ zoomIndex, setZoomIndex ] = useState( initialIndex );

	const actions = {
		reset: () => setZoomIndex( initialIndex ),
		prev: () => {
			let prevImage = zoomIndex + 1;

			if ( prevImage >= images.length ) {
				prevImage = 0;
			}

			setZoomIndex( prevImage );
		},
		next: () => {
			let nextImage = zoomIndex - 1;

			if ( nextImage < 0 ) {
				nextImage = images.length - 1;
			}

			setZoomIndex( nextImage );
		},
	};
	return {
		zoomIndex,
		setZoomIndex,
		actions,
	};
};

export default useImageNavigation;
