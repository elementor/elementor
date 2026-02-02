import { htmlPropTypeUtil, htmlV2PropTypeUtil, type PropType, stringPropTypeUtil } from '@elementor/editor-props';

type InlineEditingEligibilityArgs = {
	rawValue: unknown;
	propTypeFromSchema: PropType | null;
};

const hasKey = ( propType: PropType ): propType is PropType & { key: unknown } => {
	return 'key' in propType;
};

const isCoreTextPropTypeKey = ( key: unknown ): boolean => {
	return key === htmlPropTypeUtil.key || key === htmlV2PropTypeUtil.key || key === stringPropTypeUtil.key;
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

	return Boolean(
		propTypeFromSchema.prop_types[ htmlPropTypeUtil.key ] ||
			propTypeFromSchema.prop_types[ htmlV2PropTypeUtil.key ] ||
			propTypeFromSchema.prop_types[ stringPropTypeUtil.key ]
	);
};

export const isInlineEditingAllowed = ( { rawValue, propTypeFromSchema }: InlineEditingEligibilityArgs ): boolean => {
	if ( rawValue === null || rawValue === undefined ) {
		return isAllowedBySchema( propTypeFromSchema );
	}

	return (
		htmlPropTypeUtil.isValid( rawValue ) ||
		htmlV2PropTypeUtil.isValid( rawValue ) ||
		stringPropTypeUtil.isValid( rawValue )
	);
};
