export function findMatchingGlobalByValue< T extends { value: string } >( value: string, globals: T[] ): T | null {
	const trimmed = value.trim();

	return globals.find( ( global ) => global.value === trimmed ) ?? null;
}
