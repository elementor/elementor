import { type FontCategory } from '@elementor/editor-controls';

export type FontListItem = {
	type: 'font' | 'category';
	value: string;
};

export const useFilteredFontFamilies = ( fontFamilies: FontCategory[], searchValue: string ) => {
	return fontFamilies.reduce< FontListItem[] >( ( acc, category ) => {
		const filteredFonts = category.fonts.filter( ( font ) =>
			font.toLowerCase().includes( searchValue.toLowerCase() )
		);

		if ( filteredFonts.length ) {
			acc.push( { type: 'category', value: category.label } );

			filteredFonts.forEach( ( font ) => {
				acc.push( { type: 'font', value: font } );
			} );
		}

		return acc;
	}, [] );
};
