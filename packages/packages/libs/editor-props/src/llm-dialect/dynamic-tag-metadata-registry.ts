export type LlmDynamicTagMetadata = {
	name: string;
	label: string;
	group: string;
};

let dynamicTagsRegistry: Record< string, LlmDynamicTagMetadata > = {};
let dynamicTagsResolver: ( () => Record< string, LlmDynamicTagMetadata > | undefined ) | undefined;
let dynamicTagsResolved = false;

const mergeDynamicTags = ( tags: Record< string, LlmDynamicTagMetadata > ) => {
	dynamicTagsRegistry = {
		...dynamicTagsRegistry,
		...tags,
	};
};

const ensureDynamicTagsLoaded = () => {
	if ( dynamicTagsResolved || ! dynamicTagsResolver ) {
		return;
	}

	const resolvedTags = dynamicTagsResolver();

	if ( resolvedTags ) {
		mergeDynamicTags( resolvedTags );
	}

	dynamicTagsResolved = true;
};

export const registerLlmDialectDynamicTags = ( tags: Record< string, LlmDynamicTagMetadata > | null | undefined ) => {
	if ( ! tags ) {
		return;
	}

	mergeDynamicTags( tags );
};

export const setLlmDialectDynamicTagsResolver = (
	resolver: () => Record< string, LlmDynamicTagMetadata > | undefined
) => {
	dynamicTagsResolver = resolver;
	dynamicTagsResolved = false;
};

export const getLlmDialectDynamicTag = ( tagName: string ): LlmDynamicTagMetadata | undefined => {
	ensureDynamicTagsLoaded();
	return dynamicTagsRegistry[ tagName ];
};

export const resetLlmDialectDynamicTagsForTests = () => {
	dynamicTagsRegistry = {};
	dynamicTagsResolver = undefined;
	dynamicTagsResolved = false;
};
