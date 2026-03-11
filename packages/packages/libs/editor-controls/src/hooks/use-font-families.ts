import { useMemo } from 'react';
import { getElementorConfig } from '@elementor/editor-v1-adapters';

import { type FontCategory } from '../controls/font-family-control/font-family-control';

type FontControlConfig = {
	groups?: Record< string, string >;
	options?: Record< string, string >;
};

const getFontControlConfig = (): FontControlConfig => {
	const { controls } = getElementorConfig();

	return controls?.font ?? {};
};

export const useFontFamilies = () => {
	const { groups, options } = getFontControlConfig();

	return useMemo( () => {
		if ( ! groups || ! options ) {
			return [];
		}

		const groupKeys = Object.keys( groups );
		const groupIndexMap = new Map( groupKeys.map( ( key, index ) => [ key, index ] ) );

		return Object.entries( options )
			.reduce< FontCategory[] >( ( acc, [ font, category ] ) => {
				const groupIndex = groupIndexMap.get( category );

				if ( groupIndex === undefined ) {
					return acc;
				}

				if ( ! acc[ groupIndex ] ) {
					acc[ groupIndex ] = {
						label: groups[ category ],
						fonts: [],
					};
				}

				acc[ groupIndex ].fonts.push( font );

				return acc;
			}, [] )
			.filter( Boolean );
	}, [ groups, options ] );
};
