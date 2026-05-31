type DynamicTagSource = {
	name: string;
	label: string;
	group: string;
	categories: string[];
};

type DynamicTagsConfig = {
	tags?: Record< string, DynamicTagSource >;
	groups?: Record< string, { title: string } >;
};

export type DynamicTagResourceEntry = {
	name: string;
	label: string;
	group: string;
	categories: string[];
};

export type DynamicTagsResourcePayload = {
	groups: Record< string, { title: string } >;
	tags: Record< string, DynamicTagResourceEntry >;
	by_category: Record< string, string[] >;
};

export type DynamicTagsByCategoryPayload = {
	category: string;
	tag_names: string[];
	tags: Record< string, DynamicTagResourceEntry >;
};

const indexTagsByCategory = ( tags: Record< string, DynamicTagResourceEntry > ): Record< string, string[] > => {
	const byCategory: Record< string, Set< string > > = {};

	for ( const tag of Object.values( tags ) ) {
		for ( const category of tag.categories ) {
			if ( ! byCategory[ category ] ) {
				byCategory[ category ] = new Set();
			}
			byCategory[ category ].add( tag.name );
		}
	}

	return Object.fromEntries(
		Object.entries( byCategory ).map( ( [ category, names ] ) => [ category, [ ...names ].sort() ] )
	);
};

export const buildDynamicTagsResourcePayload = (
	atomicDynamicTags: DynamicTagsConfig | null | undefined
): DynamicTagsResourcePayload => {
	if ( ! atomicDynamicTags?.tags ) {
		return {
			groups: {},
			tags: {},
			by_category: {},
		};
	}

	const tags = Object.fromEntries(
		Object.entries( atomicDynamicTags.tags ).map( ( [ key, tag ] ) => [
			key,
			{
				name: tag.name,
				label: tag.label,
				group: tag.group,
				categories: tag.categories,
			},
		] )
	);

	return {
		groups: atomicDynamicTags.groups ?? {},
		tags,
		by_category: indexTagsByCategory( tags ),
	};
};

export const buildDynamicTagsByCategoryPayload = (
	atomicDynamicTags: DynamicTagsConfig | null | undefined,
	category: string
): DynamicTagsByCategoryPayload => {
	const fullPayload = buildDynamicTagsResourcePayload( atomicDynamicTags );
	const tagNames = fullPayload.by_category[ category ] ?? [];
	const tags = Object.fromEntries(
		tagNames.map( ( name ) => [ name, fullPayload.tags[ name ] ] ).filter( ( [ , tag ] ) => !! tag )
	);

	return {
		category,
		tag_names: tagNames,
		tags,
	};
};

export const listDynamicTagCategories = ( atomicDynamicTags: DynamicTagsConfig | null | undefined ): string[] => {
	const payload = buildDynamicTagsResourcePayload( atomicDynamicTags );
	return Object.keys( payload.by_category ).sort();
};
