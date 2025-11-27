import { useMemo } from 'react';
import { useBoundProp } from '@elementor/editor-controls';

import { getAtomicDynamicTags } from '../sync/get-atomic-dynamic-tags';
import { type DynamicTag } from '../types';
import { getDynamicPropType } from '../utils';

export const usePropDynamicTags = () => {
	let categories: string[] = [];

	const { propType } = useBoundProp();

	if ( propType ) {
		const propDynamicType = getDynamicPropType( propType );

		categories = propDynamicType?.settings.categories || [];
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo( () => getDynamicTagsByCategories( categories ), [ categories.join() ] );
};

const getDynamicTagsByCategories = ( categories: string[] ) => {
	const { tags, groups } = getAtomicDynamicTags() || {};

	if ( ! categories.length || ! tags || ! groups ) {
		return [];
	}

	const _categories = new Set( categories );

	const dynamicTags: DynamicTag[] = [];
	const groupedFilteredTags: Record< string, DynamicTag[] > = {};

	for ( const tag of Object.values( tags ) ) {
		if ( ! tag.categories.some( ( category ) => _categories.has( category ) ) ) {
			continue;
		}

		if ( ! groupedFilteredTags[ tag.group ] ) {
			groupedFilteredTags[ tag.group ] = [];
		}
		groupedFilteredTags[ tag.group ].push( tag );
	}

	for ( const group in groups ) {
		if ( groupedFilteredTags[ group ] ) {
			dynamicTags.push( ...groupedFilteredTags[ group ] );
		}
	}

	return dynamicTags;
};
