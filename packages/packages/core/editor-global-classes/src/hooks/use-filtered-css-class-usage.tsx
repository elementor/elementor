import { useMemo } from 'react';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';

import { type CssClassUsageContent, type EnhancedCssClassUsage } from '../components/css-class-usage/types';
import { type FilterKey } from '../components/filter-and-sort/types';
import { useCssClassUsage } from './use-css-class-usage';
import { useAllCssClassesIDs, useEmptyCssClass } from './use-empty-css-class';

type FilteredCssClassUsage = Record< FilterKey, string[] >;

const findCssClassKeysByPageID = ( data: EnhancedCssClassUsage, pageId: number ) => {
	const result: string[] = [];
	for ( const key in data ) {
		data[ key ].content.forEach( ( content: CssClassUsageContent ) => {
			if ( +content.pageId === pageId ) {
				result.push( key );
			}
		} );
	}
	return result;
};

const getUnusedClasses = ( usedCssClass: string[], potentialUnused: string[] ): string[] => {
	const set = new Set( usedCssClass );
	return potentialUnused.filter( ( cssClass: string ) => ! set.has( cssClass ) );
};

const EMPTY_FILTERED_CSS_CLASS_RESPONSE: FilteredCssClassUsage = {
	empty: [],
	onThisPage: [],
	unused: [],
};

export const useFilteredCssClassUsage = (): FilteredCssClassUsage => {
	const document = useActiveDocument();
	const emptyCssClasses = useEmptyCssClass();
	const { data, isLoading } = useCssClassUsage();
	const listOfCssClasses = useAllCssClassesIDs();

	const emptyCssClassesIDs = useMemo( () => emptyCssClasses.map( ( { id } ) => id ), [ emptyCssClasses ] );

	const onThisPage = useMemo( () => {
		if ( ! data || ! document ) {
			return [];
		}
		return findCssClassKeysByPageID( data, document.id );
	}, [ data, document ] );

	const unused = useMemo( () => {
		if ( ! data ) {
			return [];
		}

		return getUnusedClasses( Object.keys( data ), listOfCssClasses );
	}, [ data, listOfCssClasses ] );

	if ( isLoading || ! data || ! document ) {
		return EMPTY_FILTERED_CSS_CLASS_RESPONSE;
	}

	return {
		onThisPage,
		unused,
		empty: emptyCssClassesIDs,
	};
};
