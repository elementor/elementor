import { useState } from 'react';

const useImageNavigation = ( images ) => {
	const [ zoomedImageIndex, setZoomedImageIndex ] = useState( -1 );

	const imageNavigation = {
		backToResults: () => setZoomedImageIndex( -1 ),
		navigatePrevImage: () => {
			let prevImage = zoomedImageIndex + 1;
			if ( prevImage >= images.length ) {
				prevImage = 0;
			}
			setZoomedImageIndex( prevImage );
		},
		navigateNextImage: () => {
			let nextImage = zoomedImageIndex - 1;
			if ( nextImage < 0 ) {
				nextImage = images.length - 1;
			}
			setZoomedImageIndex( nextImage );
		},
	};
	return {
		zoomedImageIndex,
		setZoomedImageIndex,
		imageNavigation,
	};
};

export default useImageNavigation;
