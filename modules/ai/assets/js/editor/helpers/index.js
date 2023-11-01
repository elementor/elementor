
export const vh = ( value ) => {
	const h = Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );
	return ( value * h ) / 100;
};
