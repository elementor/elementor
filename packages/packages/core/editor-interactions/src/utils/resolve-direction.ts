export const resolveDirection = (
	hasDirection: boolean,
	newEffect?: string,
	newDirection?: string,
	currentDirection?: string,
	currentEffect?: string
) => {
	debugger;
	if ( newEffect === 'slide' && ! newDirection ) {
		return 'top';
	}

	if ( currentEffect === 'slide' && hasDirection ) {
		return newDirection ?? 'top';
	}
	// Why? - New direction can be undefined when the effect is not slide, so if the updates object includes direction, we take it always!
	if ( hasDirection ) {
		return newDirection;
	}
	return currentDirection;
};
