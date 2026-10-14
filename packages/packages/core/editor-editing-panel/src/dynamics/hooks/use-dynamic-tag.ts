import { useMemo } from 'react';

import { type DynamicTag } from '../types';
import { useAllPropDynamicTags } from './use-prop-dynamic-tags';

export const useDynamicTag = ( tagName: string ): DynamicTag | null => {
	const dynamicTags = useAllPropDynamicTags();

	return useMemo( () => dynamicTags.find( ( tag ) => tag.name === tagName ) ?? null, [ dynamicTags, tagName ] );
};
