export const resolveDirection = (
	hasDirection: boolean,
	newEffect?: string,
	newDirection?: string,
	currentDirection?: string,
	currentEffect?: string
) => {
	if ( newEffect === 'slide' && ! newDirection ) {
		return 'top';
	}

	if ( currentEffect === 'slide' && hasDirection ) {
		return newDirection || 'top';
	}
	
	if ( hasDirection ) {
		return newDirection;
	}
	return currentDirection;
};
