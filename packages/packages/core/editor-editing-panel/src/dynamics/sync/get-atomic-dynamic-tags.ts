import { getElementorConfig } from '../../sync/get-elementor-globals';

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
