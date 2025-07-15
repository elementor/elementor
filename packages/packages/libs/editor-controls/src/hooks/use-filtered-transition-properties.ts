import { useMemo } from 'react';

import { type TransitionCategory, transitionProperties } from '../components/transition-properties-data';

export type TransitionListItem = {
	label: string;
	value: string;
	type: 'property' | 'category';
	category?: string;
};

export const useFilteredTransitionProperties = (
	searchTerm: string,
	isProLicenseActive: boolean
): TransitionListItem[] => {
	return useMemo( () => {
		const filterPropertiesByLicense = ( category: TransitionCategory ) => {
			return category.properties.filter( ( property ) => {
				const isAccessible = property.license === 'free' || isProLicenseActive;
				return isAccessible;
			} );
		};

		if ( ! searchTerm ) {
			return transitionProperties.reduce( ( acc: TransitionListItem[], category ) => {
				const accessibleProperties = filterPropertiesByLicense( category );

				if ( accessibleProperties.length > 0 ) {
					acc.push( {
						label: category.label,
						value: category.label,
						type: 'category',
					} );

					accessibleProperties.forEach( ( property ) => {
						acc.push( {
							label: property.label,
							value: property.value,
							type: 'property',
							category: category.label,
						} );
					} );
				}

				return acc;
			}, [] );
		}

		const searchLower = searchTerm.toLowerCase();
		const filteredItems: TransitionListItem[] = [];

		transitionProperties.forEach( ( category ) => {
			const accessibleProperties = filterPropertiesByLicense( category );

			const matchingProperties = accessibleProperties.filter(
				( property ) =>
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
	}, [ searchTerm, isProLicenseActive ] );
};
