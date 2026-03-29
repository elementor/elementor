import { type Props, type PropValue } from '@elementor/editor-props';

import { type ComponentInstanceOverridesPropValue } from '../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';
import { type OverridableProps } from '../types';
import { getMatchingOverride } from './overridable-props-utils';
import { resolveOverridePropValue } from './resolve-override-prop-value';

/**
 * For a given inner element, builds a settings object where all overridable values
 * are resolved to their effective values (override value if present, otherwise origin_value).
 * Non-overridable props are unwrapped if they happen to be overridable-typed.
 * This produces "clean" settings suitable for the dependency system.
 * @param root0
 * @param root0.elementSettings
 * @param root0.elementId
 * @param root0.overridableProps
 * @param root0.overrides
 */
export function resolveInstanceSettingsForDependencies( {
	elementSettings,
	elementId,
	overridableProps,
	overrides,
}: {
	elementSettings: Props;
	elementId: string;
	overridableProps: OverridableProps;
	overrides: ComponentInstanceOverridesPropValue;
} ): Props {
	const resolved: Props = {};

	const overridableByPropKey = buildOverridableByPropKey( overridableProps, elementId );

	for ( const [ key, val ] of Object.entries( elementSettings ) ) {
		const overridableInfo = overridableByPropKey[ key ];

		if ( overridableInfo ) {
			const matchingOverride = getMatchingOverride( overrides, overridableInfo.overrideKey );

			if ( matchingOverride ) {
				resolved[ key ] = resolveOverridePropValue( matchingOverride );
			} else {
				resolved[ key ] = overridableInfo.originValue ?? unwrapIfOverridable( val );
			}
		} else {
			resolved[ key ] = unwrapIfOverridable( val );
		}
	}

	return resolved;
}

function unwrapIfOverridable( val: PropValue ): PropValue {
	if ( componentOverridablePropTypeUtil.isValid( val ) ) {
		const extracted = componentOverridablePropTypeUtil.extract( val );
		return extracted?.origin_value ?? null;
	}

	return val;
}

type OverridableByPropKey = Record< string, { overrideKey: string; originValue: PropValue } >;

function buildOverridableByPropKey( overridableProps: OverridableProps, elementId: string ): OverridableByPropKey {
	const result: OverridableByPropKey = {};

	for ( const prop of Object.values( overridableProps.props ) ) {
		const originFields = prop.originPropFields ?? prop;
		if ( originFields.elementId === elementId ) {
			result[ originFields.propKey ] = {
				overrideKey: prop.overrideKey,
				originValue: prop.originValue,
			};
		}
	}

	return result;
}
