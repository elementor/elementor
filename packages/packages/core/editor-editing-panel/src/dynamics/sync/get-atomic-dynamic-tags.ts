import { getElementorConfig } from './get-elementor-config';

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
