import { useMemo } from 'react';

import { type DynamicTag } from '../types';
import { usePropDynamicTags } from './use-prop-dynamic-tags';

export const useDynamicTag = ( tagName: string ): DynamicTag | null => {
	const dynamicTags = usePropDynamicTags();

	return useMemo( () => dynamicTags.find( ( tag ) => tag.name === tagName ) ?? null, [ dynamicTags, tagName ] );
};
