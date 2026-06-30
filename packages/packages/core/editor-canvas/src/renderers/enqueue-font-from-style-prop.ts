import { getPropSchemaFromCache, isTransformable, type PropType } from '@elementor/editor-props';

export const maybeEnqueueFontFromStyleProp = (
	propType: PropType,
	propValue: unknown,
	enqueue: ( font: string ) => void
): void => {
	if ( ! isTransformable( propValue ) || propValue.disabled ) {
		return;
	}

	const typeKey = propType.kind === 'union' ? propValue.$$type : propType.key;
	const propTypeUtil = getPropSchemaFromCache( typeKey );

	if (
		! propTypeUtil ||
		! ( 'getEnqueueFontFamily' in propTypeUtil ) ||
		typeof propTypeUtil.getEnqueueFontFamily !== 'function'
	) {
		return;
	}

	const stored = propValue.value;

	if ( typeof stored !== 'string' ) {
		return;
	}

	const font = propTypeUtil.getEnqueueFontFamily( stored );

	if ( font ) {
		enqueue( font );
	}
};
