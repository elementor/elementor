import { getLicenseConfig } from '../../hooks/use-license-config';
import { getElementorConfig } from '../../sync/get-elementor-globals';
import { type DynamicTags } from '../types';

export const getAtomicDynamicTags = () => {
	const { atomicDynamicTags } = getElementorConfig();

	if ( ! atomicDynamicTags ) {
		return null;
	}

	return {
		tags: filterByLicense( atomicDynamicTags.tags ),
		groups: atomicDynamicTags.groups,
	};
};

const filterByLicense = ( tags: DynamicTags ) => {
	const { expired } = getLicenseConfig();

	if ( expired ) {
		return Object.fromEntries(
			Object.entries( tags ).filter(
				( [ , tag ] ) => ! ( tag?.meta?.origin === 'elementor' && tag?.meta?.required_license )
			)
		);
	}

	return tags;
};
