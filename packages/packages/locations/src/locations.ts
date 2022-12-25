import { Fill, FillWithOptionalPriority } from './types';

let fills: Fill[] = [];

export const addFill = ( { location, component, priority = 10 }: FillWithOptionalPriority ): void => {
	fills.push( { location, component, priority } );
};

export const getFills = ( location: string ): Fill[] => {
	return fills
		.filter( ( fill ) => fill.location === location )
		.sort( ( a, b ) => a.priority - b.priority );
};

export const resetFills = (): void => {
	fills = [];
};
