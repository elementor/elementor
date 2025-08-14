import { getElementStyles } from '@elementor/editor-elements';
import { type Props } from '@elementor/editor-props';

const quickTransform = ( props: Props ) => {
	return Object.entries( props ).map( ( [ key, value ] ) => {
		if ( value && typeof value === 'object' && '$$type' in value ) {
			if ( value?.$$type === 'dimensions' ) {
				return Object.keys( value?.value ?? {} ).map( ( nestedKey ) => `${ key }-${ nestedKey }` );
			}
			// If not fully reset through element style reset, an array type property name is still in the 'changed' list with an empty array,
			// so we need to filter out these properties. https://elementor.atlassian.net/browse/ED-20434
			if ( Array.isArray( value?.value ) && ! value?.value?.length ) {
				return [];
			}
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
