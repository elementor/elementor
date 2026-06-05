import { type KitSnapshot } from '../types';

type GlobalColor = KitSnapshot[ 'globals' ][ 'colors' ][ number ];

export function findMatchingGlobalColor( value: string, globals: GlobalColor[] ): GlobalColor | null {
	const trimmed = value.trim();

	return globals.find( ( global ) => global.value === trimmed ) ?? null;
}
