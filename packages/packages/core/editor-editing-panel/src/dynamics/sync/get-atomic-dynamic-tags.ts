import { getElementorConfig } from '@elementor/editor-v1-adapters';

import { getLicenseConfig } from '../../hooks/use-license-config';
import { type DynamicTags } from '../types';

export const getAtomicDynamicTags = ( shouldFilterByLicense: boolean = true ) => {
	const { atomicDynamicTags } = getElementorConfig();

	if ( ! atomicDynamicTags ) {
		return null;
	}

	return {
		tags: shouldFilterByLicense ? filterByLicense( atomicDynamicTags.tags ) : atomicDynamicTags.tags,
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
