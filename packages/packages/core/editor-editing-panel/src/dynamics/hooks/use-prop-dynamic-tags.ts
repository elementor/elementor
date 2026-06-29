import { useMemo } from 'react';
import { useBoundProp } from '@elementor/editor-controls';

import { getAtomicDynamicTags } from '../sync/get-atomic-dynamic-tags';
import { type DynamicTag } from '../types';
import { getDynamicPropType } from '../utils';

export const usePropDynamicTags = () => {
	return usePropDynamicTagsInternal( true );
};

export const useAllPropDynamicTags = () => {
	return usePropDynamicTagsInternal( false );
};

const usePropDynamicTagsInternal = ( filterByLicense: boolean ) => {
	let categories: string[] = [];

	const { propType } = useBoundProp();

	if ( propType ) {
		const propDynamicType = getDynamicPropType( propType );

		categories = propDynamicType?.settings.categories || [];
	}

	const categoriesKey = categories.join();

	return useMemo(
		() => getDynamicTagsByCategories( categories, filterByLicense ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ categoriesKey, filterByLicense ]
	);
};

const getDynamicTagsByCategories = ( categories: string[], filterByLicense: boolean ) => {
	const { tags, groups } = getAtomicDynamicTags( filterByLicense ) || {};

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
