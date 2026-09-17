const GRID_TRACK_PROPERTIES = new Set( [ 'grid-template-columns', 'grid-template-rows' ] );

export const isGridTrackProperty = ( cssProperty: string ): boolean => GRID_TRACK_PROPERTIES.has( cssProperty );

export const formatGridTrackRepeat = ( count: number ): string | null => {
	if ( ! Number.isFinite( count ) || count < 1 ) {
		return null;
	}

	return `repeat(${ count }, 1fr)`;
};
