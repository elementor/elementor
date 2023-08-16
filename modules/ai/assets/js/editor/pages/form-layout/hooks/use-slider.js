import { useState } from 'react';

const useSlider = ( {
	slidesCount = 0,
	slidesPerPage = 3,
	gapPercentage = 2,
	translateXFilter = ( value ) => value,
} = {} ) => {
	const [ currentPage, setCurrentPage ] = useState( 1 );
	const gapsNumber = slidesPerPage - 1;
	const slideWidthPercentage = ( 100 - ( gapPercentage * gapsNumber ) ) / slidesPerPage;
	const offsetXPercentage = ( ( slideWidthPercentage + gapPercentage ) * slidesPerPage ) * ( currentPage - 1 );
	const translateX = translateXFilter( `-${ offsetXPercentage }%` );
	const pagesCount = Math.ceil( slidesCount / slidesPerPage );
	const sliderStyle = { overflow: 'hidden' };
	const trackStyle = {
		display: 'flex',
		transition: 'all 0.4s ease',
		gap: `${ gapPercentage }%`,
		transform: `translateX(${ translateX })`,
	};
	const slideStyle = { flex: `0 0 ${ slideWidthPercentage }%` };

	return {
		currentPage,
		setCurrentPage,
		pagesCount,
		sliderStyle,
		trackStyle,
		slideStyle,
		slidesPerPage,
	};
};

export default useSlider;
