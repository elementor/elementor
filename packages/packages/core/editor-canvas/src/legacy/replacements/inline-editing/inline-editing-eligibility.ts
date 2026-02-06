import { htmlV2PropTypeUtil, type PropType, stringPropTypeUtil } from '@elementor/editor-props';

type InlineEditingEligibilityArgs = {
	rawValue: unknown;
	propTypeFromSchema: PropType | null;
};

const hasKey = ( propType: PropType ): propType is PropType & { key: unknown } => {
	return 'key' in propType;
};

const TEXT_PROP_TYPE_KEYS = new Set( [
	htmlV2PropTypeUtil.key,
	stringPropTypeUtil.key,
] );

const isCoreTextPropTypeKey = ( key: unknown ): boolean => {
	return ( TEXT_PROP_TYPE_KEYS as Set<unknown> ).has( key );
};

const isAllowedBySchema = ( propTypeFromSchema: PropType | null ): boolean => {
	if ( ! propTypeFromSchema ) {
		return false;
	}

	if ( hasKey( propTypeFromSchema ) && isCoreTextPropTypeKey( propTypeFromSchema.key ) ) {
		return true;
	}

	if ( propTypeFromSchema.kind !== 'union' ) {
		return false;
	}

	return [ ...TEXT_PROP_TYPE_KEYS ].some( ( key ) => propTypeFromSchema.prop_types[ key ] );
};

export const isInlineEditingAllowed = ( { rawValue, propTypeFromSchema }: InlineEditingEligibilityArgs ): boolean => {
	if ( rawValue === null || rawValue === undefined ) {
		return isAllowedBySchema( propTypeFromSchema );
	}

	return htmlV2PropTypeUtil.isValid( rawValue ) || stringPropTypeUtil.isValid( rawValue );
};
