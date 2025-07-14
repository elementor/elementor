import { useMemo } from 'react';
import { type TransitionCategory } from '../components/transition-properties-data';

export type TransitionListItem = {
	label: string;
	value: string;
	type: 'property' | 'category';
	category?: string;
};

export const useFilteredTransitionProperties = (
	categories: TransitionCategory[],
	searchTerm: string
): TransitionListItem[] => {
	return useMemo( () => {
		if ( ! searchTerm ) {
			// Return all items organized by category
			return categories.reduce( ( acc: TransitionListItem[], category ) => {
				acc.push( {
					label: category.label,
					value: category.label,
					type: 'category',
				} );

				category.properties.forEach( ( property ) => {
					acc.push( {
						label: property.label,
						value: property.value,
						type: 'property',
						category: category.label,
					} );
				} );

				return acc;
			}, [] );
		}

		// Filter properties based on search term
		const searchLower = searchTerm.toLowerCase();
		const filteredItems: TransitionListItem[] = [];

		categories.forEach( ( category ) => {
			const matchingProperties = category.properties.filter( ( property ) =>
				property.label.toLowerCase().includes( searchLower ) ||
				property.value.toLowerCase().includes( searchLower )
			);

			if ( matchingProperties.length > 0 ) {
				filteredItems.push( {
					label: category.label,
					value: category.label,
					type: 'category',
				} );

				matchingProperties.forEach( ( property ) => {
					filteredItems.push( {
						label: property.label,
						value: property.value,
						type: 'property',
						category: category.label,
					} );
				} );
			}
		} );

		return filteredItems;
	}, [ categories, searchTerm ] );
}; 