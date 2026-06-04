type DynamicTagsConfig = {
	tags?: Record<
		string,
		{
			name: string;
			label: string;
			group: string;
			categories: string[];
		}
	>;
	groups?: Record< string, { title: string } >;
};

const indexTagsByCategory = ( tags: NonNullable< DynamicTagsConfig[ 'tags' ] > ): Record< string, string[] > => {
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

export const buildDynamicTagsResourcePayload = ( atomicDynamicTags: DynamicTagsConfig | null | undefined ) => {
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
) => {
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
