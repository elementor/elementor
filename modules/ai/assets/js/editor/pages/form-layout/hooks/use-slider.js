import { useState } from 'react';

const useSlider = ( { slidesCount = 0, slidesPerPage = 3, gapPercentage = 2 } = {} ) => {
	const [ currentPage, setCurrentPage ] = useState( 1 );

	const gapsCount = slidesPerPage - 1;
	const slideWidthPercentage = ( 100 - ( gapPercentage * gapsCount ) ) / slidesPerPage;
	const offsetXPercentage = ( ( slideWidthPercentage + gapPercentage ) * slidesPerPage ) * ( currentPage - 1 );
	const pagesCount = Math.ceil( slidesCount / slidesPerPage );

	return {
		currentPage,
		setCurrentPage,
		pagesCount,
		slidesPerPage,
		gapPercentage,
		offsetXPercentage,
		slideWidthPercentage,
	};
};

export default useSlider;
