import { type KitSnapshot } from '../types';

type GlobalFont = KitSnapshot[ 'globals' ][ 'fonts' ][ number ];

export function findMatchingGlobalFont( value: string, globals: GlobalFont[] ): GlobalFont | null {
	const trimmed = value.trim();

	return globals.find( ( global ) => global.value === trimmed ) ?? null;
}
