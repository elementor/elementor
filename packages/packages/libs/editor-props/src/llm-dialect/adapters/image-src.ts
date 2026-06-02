import { type PropType, type PropValue } from '../../types';
import { isTransformable } from '../../utils/is-transformable';
import { type PropDialectAdapter } from '../registry';
import { stripDynamicBinding } from '../strip-dynamic-binding';

const IMAGE_SRC = 'image-src';
const IMAGE = 'image';
const STRING = 'string';
const DEFAULT_IMAGE_SIZE = 'full';
const BIND_TO_KEY = 'bindTo';
const ALLOW_BIND_KEY = 'allowBind';

const wrapImageSrcInImage = ( imageSrc: PropValue ): PropValue =>
	( {
		$$type: IMAGE,
		value: {
			src: imageSrc,
			size: { $$type: STRING, value: DEFAULT_IMAGE_SIZE },
		},
	} ) as PropValue;

const isEmptyImageSrc = ( value: PropValue ): boolean => {
	if (
		! isTransformable( value ) ||
		value.$$type !== IMAGE_SRC ||
		typeof value.value !== 'object' ||
		value.value === null
	) {
		return false;
	}

	const inner = value.value as Record< string, unknown >;
	const hasId = Object.hasOwn( inner, 'id' ) && hasActualValue( inner.id );
	const hasUrl = Object.hasOwn( inner, 'url' ) && hasActualValue( inner.url );

	return ! hasId && ! hasUrl;
};

const withoutDynamicFallback = (
	value: PropValue,
	dynamicValue: { settings?: Record< string, unknown > }
): PropValue => {
	const { fallback: _fallback, ...restSettings } = dynamicValue.settings ?? {};

	return {
		...( value as object ),
		value: {
			...dynamicValue,
			settings: restSettings,
		},
	} as PropValue;
};

const extractImageSrcForDialect = ( value: PropValue ): PropValue => {
	if ( ! isTransformable( value ) || value.$$type !== IMAGE ) {
		return value;
	}

	const src = ( value.value as { src?: PropValue } | null )?.src;

	if ( ! src || ! isTransformable( src ) ) {
		return value;
	}

	const markers = value as Record< string, unknown >;
	const result: Record< string, unknown > = { ...src };

	if ( markers[ BIND_TO_KEY ] !== undefined ) {
		result[ BIND_TO_KEY ] = markers[ BIND_TO_KEY ];
	}

	if ( markers[ ALLOW_BIND_KEY ] !== undefined ) {
		result[ ALLOW_BIND_KEY ] = markers[ ALLOW_BIND_KEY ];
	}

	return result as PropValue;
};

const isImageSrcContext = ( propType: PropType ) =>
	( propType.kind === 'object' && propType.key === IMAGE_SRC ) ||
	( propType.kind === 'union' &&
		Object.hasOwn( propType.prop_types, IMAGE_SRC ) &&
		Object.hasOwn( propType.prop_types, 'dynamic' ) );

const getImageSrcPropType = ( propType: PropType ): PropType | null => {
	if ( propType.kind === 'object' && propType.key === IMAGE_SRC ) {
		return propType;
	}

	if ( propType.kind === 'union' ) {
		const imageSrc = propType.prop_types[ IMAGE_SRC ];
		return imageSrc?.kind === 'object' && imageSrc.key === IMAGE_SRC ? imageSrc : null;
	}

	return null;
};

const getImageSrcDefaultValue = ( ctxPropType: PropType ): PropValue | null => {
	const defaultValue = getImageSrcPropType( ctxPropType )?.default;

	if ( ! defaultValue || ! isTransformable( defaultValue ) ) {
		return null;
	}

	return structuredClone( defaultValue ) as PropValue;
};

const ensureAltNull = ( value: PropValue ): PropValue => {
	if ( ! isTransformable( value ) || value.$$type !== IMAGE_SRC ) {
		return value;
	}

	if ( typeof value.value !== 'object' || value.value === null ) {
		return value;
	}

	const nextValue = value.value as Record< string, unknown >;
	if ( Object.hasOwn( nextValue, 'alt' ) && nextValue.alt !== undefined ) {
		return value;
	}

	return {
		...value,
		value: {
			...nextValue,
			alt: null,
		},
	};
};

const hasActualValue = ( value: unknown ): boolean => {
	if ( value === undefined || value === null ) {
		return false;
	}

	if ( isTransformable( value ) ) {
		return hasActualValue( ( value as { value?: unknown } ).value );
	}

	if ( typeof value === 'string' ) {
		return value.trim().length > 0;
	}

	if ( typeof value === 'number' ) {
		return Number.isFinite( value ) && value !== 0;
	}

	return true;
};

const coerceToDefaultWhenNoValidIdOrUrl = ( value: PropValue, ctxPropType: PropType ): PropValue => {
	if ( ! isTransformable( value ) || value.$$type !== IMAGE_SRC ) {
		return value;
	}

	if ( typeof value.value !== 'object' || value.value === null ) {
		return value;
	}

	const inner = value.value as Record< string, unknown >;
	const id = inner.id;
	const url = inner.url;

	const hasValidId = Object.hasOwn( inner, 'id' ) ? hasActualValue( id ) : false;
	const hasValidUrl = Object.hasOwn( inner, 'url' ) ? hasActualValue( url ) : false;

	if ( hasValidId || hasValidUrl ) {
		return value;
	}

	const defaultValue = getImageSrcDefaultValue( ctxPropType );
	return defaultValue ?? value;
};

const migrateImageSrc = ( value: PropValue, ctxPropType: PropType ): PropValue =>
	coerceToDefaultWhenNoValidIdOrUrl( ensureAltNull( value ), ctxPropType );

const BINDABLE_IMAGE_SRC_FIELDS = [ 'url', 'id' ] as const;
type BindableImageSrcField = ( typeof BINDABLE_IMAGE_SRC_FIELDS )[ number ];

const findDynamicChildField = (
	inner: Record< string, unknown >
): { field: BindableImageSrcField; child: PropValue } | null => {
	for ( const field of BINDABLE_IMAGE_SRC_FIELDS ) {
		const child = inner[ field ];

		if ( isTransformable( child ) && child.$$type === 'dynamic' ) {
			return { field, child };
		}
	}

	return null;
};

const hoistImageSrcDynamicChild = ( child: PropValue, field: BindableImageSrcField ): PropValue => {
	const dynamicValue = child.value as { settings?: Record< string, unknown > };
	const boundFallback = dynamicValue.settings?.fallback as PropValue | undefined;

	if ( ! boundFallback || ! hasActualValue( boundFallback ) ) {
		return withoutDynamicFallback( child, dynamicValue );
	}

	const imageSrc = {
		$$type: IMAGE_SRC,
		value: {
			id: field === 'id' ? boundFallback : null,
			url: field === 'url' ? boundFallback : null,
			alt: null,
		},
	} as PropValue;

	return {
		...child,
		value: {
			...dynamicValue,
			settings: {
				...dynamicValue.settings,
				fallback: wrapImageSrcInImage( imageSrc ),
			},
		},
	} as PropValue;
};

export const imageSrcLlmDialectAdapter: PropDialectAdapter = {
	id: 'image-src',
	matches: () => true,
	toDialectSchema: ( schema, ctx ) => {
		if ( ctx.parentPropType?.key !== IMAGE_SRC ) {
			return schema;
		}

		return stripDynamicBinding( schema );
	},
	toPropValue: ( value, ctx ) => {
		if ( ! isImageSrcContext( ctx.propType ) || ! isTransformable( value ) ) {
			return value;
		}

		if ( value.$$type === IMAGE_SRC ) {
			if ( typeof value.value === 'object' && value.value !== null ) {
				const dynamicChild = findDynamicChildField( value.value as Record< string, unknown > );

				if ( dynamicChild ) {
					return hoistImageSrcDynamicChild( dynamicChild.child, dynamicChild.field );
				}
			}

			return migrateImageSrc( value, ctx.propType );
		}

		if ( value.$$type !== 'dynamic' ) {
			return value;
		}

		const dynamicValue = value.value as { settings?: { fallback?: PropValue } };
		const fallback = dynamicValue.settings?.fallback;
		if ( ! fallback || ! isTransformable( fallback ) || fallback.$$type !== IMAGE_SRC ) {
			return value;
		}

		const migrated = migrateImageSrc( fallback, ctx.propType );

		if ( isEmptyImageSrc( migrated ) ) {
			return withoutDynamicFallback( value, dynamicValue );
		}

		return {
			...value,
			value: {
				...dynamicValue,
				settings: {
					...dynamicValue.settings,
					fallback: wrapImageSrcInImage( migrated ),
				},
			},
		};
	},
	toDialectValue: ( value, ctx ) => {
		if ( ! isImageSrcContext( ctx.propType ) ) {
			return value;
		}

		return extractImageSrcForDialect( value );
	},
};
