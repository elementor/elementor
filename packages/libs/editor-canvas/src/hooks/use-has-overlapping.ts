import { type CanvasExtendedWindow } from '../sync/types';

const possibleOverlappingSelectors = [ '.e-off-canvas' ]; // can add more selectors here if needed, make sure to loop through them to check classList

export const useHasOverlapping = () => {
	const preview = ( window as unknown as CanvasExtendedWindow ).elementor?.$preview?.[ 0 ];
	if ( ! preview ) {
		return false;
	}
	const hasOverlapping = possibleOverlappingSelectors
		.map( ( selector ) => Array.from( preview?.contentWindow?.document.body.querySelectorAll( selector ) ?? [] ) )
		.flat()
		.some( ( elem ) =>
			elem.checkVisibility( {
				opacityProperty: true,
				visibilityProperty: true,
				contentVisibilityAuto: true,
			} )
		);
	return hasOverlapping;
};
