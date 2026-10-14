import { createPropsResolver, styleTransformersRegistry } from '@elementor/editor-canvas';
import { getElementStyles } from '@elementor/editor-elements';
import { getStylesSchema } from '@elementor/editor-styles';

export const getRecentlyUsedList = async ( elementId: string ) => {
	if ( ! elementId ) {
		return [];
	}
	const resolver = createPropsResolver( {
		transformers: styleTransformersRegistry,
		schema: getStylesSchema(),
	} );

	const styles = getElementStyles( elementId ) ?? {};
	const styleKeys = Object.keys( styles ?? {} );
	const variants = styleKeys.map( ( key ) => styles?.[ key ]?.variants ?? [] );

	const resolved = await Promise.all(
		variants.flat().map( async ( variant ) => {
			const result = await resolver( {
				props: variant.props ?? {},
				schema: getStylesSchema(),
			} );
			return Object.entries( result )
				.filter( ( [ , value ] ) => value !== null )
				.map( ( [ key ] ) => key );
		} )
	);

	const propSet = new Set( resolved.flat() );
	return Array.from( propSet );
};
