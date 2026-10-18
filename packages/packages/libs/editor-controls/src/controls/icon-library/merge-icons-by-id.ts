export function mergeIconsById< T extends { id: string } >( primary: T[], secondary: T[] ): T[] {
	const ids = new Set( primary.map( ( icon ) => icon.id ) );

	return [ ...primary, ...secondary.filter( ( icon ) => ! ids.has( icon.id ) ) ];
}
