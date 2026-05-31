import { stringPropTypeUtil } from '../prop-types/string';
import { type PropType, type PropValue, type TransformablePropValue, type UnionPropType } from '../types';

type HtmlV3PropValue = TransformablePropValue<
	'html-v3',
	{
		content?: PropValue;
		children?: PropValue[];
	}
>;

const STATIC_UNION_MEMBER_KEYS = new Set( [ 'dynamic', 'overridable' ] );

const isTransformablePropValue = ( value: unknown ): value is TransformablePropValue< string, unknown > =>
	typeof value === 'object' && value !== null && '$$type' in value;

export const isHtmlV3PropValue = ( value: unknown ): value is HtmlV3PropValue =>
	isTransformablePropValue( value ) && value.$$type === 'html-v3';

export const isHtmlV3UnionPropType = ( propType?: PropType ): boolean => {
	if ( ! propType || propType.kind !== 'union' ) {
		return false;
	}

	return Object.entries( ( propType as UnionPropType ).prop_types || {} ).some(
		( [ key, memberPropType ] ) => ! STATIC_UNION_MEMBER_KEYS.has( key ) && memberPropType.key === 'html-v3'
	);
};

export const htmlV3ToDynamicFallback = ( fallback: PropValue ): PropValue => {
	if ( ! isHtmlV3PropValue( fallback ) ) {
		return fallback;
	}

	const content = fallback.value?.content;

	if ( isTransformablePropValue( content ) && content.$$type === 'string' ) {
		return content;
	}

	const extractedContent = content ? stringPropTypeUtil.extract( content ) : null;

	return {
		$$type: 'string',
		value: extractedContent ?? '',
	};
};

export const dynamicFallbackToHtmlV3 = ( fallback: PropValue ): PropValue => {
	if ( isHtmlV3PropValue( fallback ) ) {
		return fallback;
	}

	if ( isTransformablePropValue( fallback ) && fallback.$$type === 'string' ) {
		return {
			$$type: 'html-v3',
			value: {
				content: fallback,
				children: [],
			},
		};
	}

	return fallback;
};
