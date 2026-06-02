import { stringPropTypeUtil, type StringPropValue } from '../../prop-types';
import { type PropType, type PropValue, type TransformablePropValue } from '../../types';
import { isTransformable } from '../../utils/is-transformable';
import { type PropDialectAdapter } from '../registry';
import { stripDynamicBinding } from '../strip-dynamic-binding';

const HTML_V3_KEY = 'html-v3';
const CONTENT_KEY = 'content';

const isHtmlV3InUnion = ( propType: PropType ) =>
	propType.kind === 'union' &&
	Object.hasOwn( propType.prop_types, 'html-v3' ) &&
	Object.hasOwn( propType.prop_types, 'dynamic' );

const isHtmlV3 = ( value: unknown ): value is TransformablePropValue< string, unknown > =>
	isTransformable( value ) && value.$$type === 'html-v3';

const flattenHtmlV3ToString = ( value?: unknown ): StringPropValue | null => {
	if ( ! isHtmlV3( value ) ) {
		return null;
	}

	const content = ( value.value as Record< string, unknown > ).content;

	if ( ! isTransformable( content ) || content.$$type !== 'string' ) {
		return null;
	}

	return { $$type: 'string', value: String( content.value ) };
};

function generateEmptyStringPT(): StringPropValue {
	return stringPropTypeUtil.create( null );
}

const hasBindTo = ( value: PropValue ) =>
	isTransformable( value ) && typeof ( value as Record< string, unknown > ).bindTo === 'string';

const stringBindToToHtmlV3Wire = ( value: PropValue ): PropValue | null => {
	if ( ! isTransformable( value ) || value.$$type !== 'string' || ! hasBindTo( value ) ) {
		return null;
	}

	const wire = value as Record< string, unknown >;

	return {
		$$type: 'html-v3',
		value: {
			content: { $$type: 'string', value: value.value },
			children: [],
		},
		...( typeof wire.bindTo === 'string' ? { bindTo: wire.bindTo } : {} ),
		...( wire.allowBind !== undefined ? { allowBind: wire.allowBind } : {} ),
	} as PropValue;
};

const dynamicStringFallbackToHtmlV3Wire = ( value: PropValue ): PropValue | null => {
	if ( ! isTransformable( value ) || value.$$type !== 'dynamic' ) {
		return null;
	}

	const fallback = ( value.value as { settings?: { fallback?: StringPropValue } } ).settings?.fallback;

	if ( ! isTransformable( fallback ) || fallback.$$type !== 'string' ) {
		return null;
	}

	return {
		$$type: 'html-v3',
		value: {
			content: structuredClone( fallback ),
			children: [],
		},
	} as PropValue;
};

export const htmlV3LlmDialectAdapter: PropDialectAdapter = {
	id: 'html-v3',
	matches: () => true,
	toDialectSchema: ( schema, ctx ) => {
		if ( ctx.parentPropType?.key !== HTML_V3_KEY || ctx.shapeKey !== CONTENT_KEY ) {
			return schema;
		}

		return stripDynamicBinding( schema );
	},
	toPropValue: ( value, ctx ) => {
		if ( ! isTransformable( value ) ) {
			return value;
		}
		if ( value.$$type === 'html-v3' ) {
			const content = ( value.value as Record< string, unknown > )?.content;

			if ( isHtmlV3InUnion( ctx.propType ) && isTransformable( content ) && content.$$type === 'dynamic' ) {
				return content;
			}

			value.value.children = value.value.children || [];
			return value;
		}
		if ( value.$$type !== 'dynamic' || ! isHtmlV3InUnion( ctx.propType ) ) {
			return value;
		}

		const dynamicValue = value.value as { settings?: { fallback?: unknown } };
		const fallback = dynamicValue.settings?.fallback;

		if ( isTransformable( fallback ) && fallback.$$type === 'string' ) {
			return value;
		}

		const stringFallback = flattenHtmlV3ToString( fallback ) ?? generateEmptyStringPT();

		return {
			...value,
			value: {
				...dynamicValue,
				settings: {
					...dynamicValue.settings,
					fallback: stringFallback,
				},
			},
		};
	},
	toDialectValue: ( value, ctx ) => {
		if ( ! isHtmlV3InUnion( ctx.propType ) || ! isTransformable( value ) ) {
			return value;
		}

		return dynamicStringFallbackToHtmlV3Wire( value ) ?? stringBindToToHtmlV3Wire( value ) ?? value;
	},
};
