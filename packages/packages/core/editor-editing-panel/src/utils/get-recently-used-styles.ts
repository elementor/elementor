import { getElementStyles } from '@elementor/editor-elements';
import { type Props } from '@elementor/editor-props';

const quickTransform = ( props: Props ) => {
	return Object.entries( props ).map( ( [ key, value ] ) => {
		if ( value && typeof value === 'object' && '$$type' in value && value?.$$type === 'dimensions' ) {
			return Object.keys( value?.value ?? {} ).map( ( nestedKey ) => `${ key }-${ nestedKey }` );
		}
		return [ key ];
	} );
};

export const getRecentlyUsedList = ( elementId: string | undefined ) => {
	if ( ! elementId ) {
		return [];
	}

	const styles = getElementStyles( elementId );
	const styleKeys = Object.keys( styles ?? {} );
	const variants = styleKeys.map( ( key ) => styles?.[ key ]?.variants ?? [] );
	const propList = variants
		.flat()
		.filter( ( variant ) => variant !== undefined )
		.map( ( variant ) => variant.props );
	const propSet = new Set( propList.map( quickTransform ).flat( 2 ) );
	return Array.from( propSet );
};
