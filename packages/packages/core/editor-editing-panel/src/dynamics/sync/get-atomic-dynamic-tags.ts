import { getElementorConfig } from '@elementor/editor-v1-adapters';

export const getAtomicDynamicTags = () => {
	const { atomicDynamicTags } = getElementorConfig();

	if ( ! atomicDynamicTags ) {
		return null;
	}

	return {
		tags: atomicDynamicTags.tags,
		groups: atomicDynamicTags.groups,
	};
};
