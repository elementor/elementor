type MergeableIcon = { id: string; library?: string; name?: string; aliases?: string[] };

const getNames = ( icon: MergeableIcon ) => [ icon.name, ...( icon.aliases ?? [] ) ].filter( Boolean );

/**
 * Providers may name an icon by one of its aliases (Pro lists `home` where Free lists `house`),
 * so an icon already present under any of its names in the same library is not added again.
 * @param primary
 * @param secondary
 */
export function mergeIconsById< T extends MergeableIcon >( primary: T[], secondary: T[] ): T[] {
	const ids = new Set( primary.map( ( icon ) => icon.id ) );
	const names = new Set(
		primary.flatMap( ( icon ) => getNames( icon ).map( ( name ) => `${ icon.library }:${ name }` ) )
	);

	return [
		...primary,
		...secondary.filter(
			( icon ) =>
				! ids.has( icon.id ) &&
				! getNames( icon ).some( ( name ) => names.has( `${ icon.library }:${ name }` ) )
		),
	];
}
