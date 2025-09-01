import { useMemo } from 'react';
import { useBoundProp } from '@elementor/editor-controls';

import { getAtomicDynamicTags } from '../sync/get-atomic-dynamic-tags';
import { getDynamicPropType } from '../utils';

export const usePropDynamicTags = () => {
	let categories: string[] = [];

	const { propType } = useBoundProp();

	if ( propType ) {
		const propDynamicType = getDynamicPropType( propType );

		categories = propDynamicType?.settings.categories || [];
	}

	// eslint-disable-next-line react-compiler/react-compiler
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo( () => getDynamicTagsByCategories( categories ), [ categories.join() ] );
};

const getDynamicTagsByCategories = ( categories: string[] ) => {
	const dynamicTags = getAtomicDynamicTags();

	if ( ! categories.length || ! dynamicTags?.tags ) {
		return [];
	}

	const _categories = new Set( categories );

	return Object.values( dynamicTags.tags ).filter( ( dynamicTag ) =>
		dynamicTag.categories.some( ( category ) => _categories.has( category ) )
	);
};
