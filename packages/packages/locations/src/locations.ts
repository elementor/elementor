import { Filler, FillerWithOptionalPriority } from './types';

let fillers: Filler[] = [];

export const addFiller = ( { location, component, priority = 10 }: FillerWithOptionalPriority ): void => {
	fillers.push( { location, component, priority } );
};

export const getFillers = ( location: string ): Filler[] => {
	return fillers
		.filter( ( filler ) => filler.location === location )
		.sort( ( a, b ) => a.priority - b.priority );
};

export const resetFillers = (): void => {
	fillers = [];
};
