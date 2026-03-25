import { getElementSetting } from '@elementor/editor-elements';

import { componentInstanceOverridePropTypeUtil } from '../../../prop-types/component-instance-override-prop-type';
import {
	type ComponentInstanceOverride,
	componentInstanceOverridesPropTypeUtil,
} from '../../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { type OverridableProp } from '../../../types';
import { getContainerByOriginId } from '../../../utils/get-container-by-origin-id';
import { getOverridableProp } from '../../../utils/get-overridable-prop';
import { extractInnerOverrideInfo, getMatchingOverride } from '../../../utils/overridable-props-utils';
import { resolveOverridePropValue, type SettingsOverride } from '../../../utils/resolve-override-prop-value';

type CollectedOverride = Required< SettingsOverride >;

type InnerElementResult = {
	container: ReturnType< typeof getContainerByOriginId >;
	collectedOverrides: CollectedOverride[];
};

export function resolveElementOverridesChain(
	overridableProp: OverridableProp,
	scopeElementId: string,
	matchingOverride: ComponentInstanceOverride | null,
	collectedOverrides: CollectedOverride[] = [],
	depth = 0
): InnerElementResult {
	if ( ! overridableProp.originPropFields ) {
		const result = getContainerByOriginId( overridableProp.elementId, scopeElementId );
		return { container: result, collectedOverrides };
	}

	const intermediateInstance = getContainerByOriginId( overridableProp.elementId, scopeElementId );

	if ( ! intermediateInstance ) {
		return { container: null, collectedOverrides };
	}

	const instanceSetting = getElementSetting( intermediateInstance.id, 'component_instance' );
	const instanceValue = componentInstancePropTypeUtil.extract( instanceSetting );
	const innerComponentId = instanceValue?.component_id?.value;
	const intermediateOverrides = componentInstanceOverridesPropTypeUtil.extract( instanceValue?.overrides );

	const mergedOverrides = collectOverridesFromLevel( collectedOverrides, intermediateOverrides ?? [] );

	const innerInfo = extractInnerOverrideInfo( matchingOverride );

	if ( ! innerInfo || ! innerComponentId ) {
		const result = getContainerByOriginId( overridableProp.originPropFields.elementId, intermediateInstance.id );
		return { container: result, collectedOverrides: mergedOverrides };
	}

	const innerOverridableProp = getOverridableProp( {
		componentId: innerComponentId,
		overrideKey: innerInfo.innerOverrideKey,
	} );

	if ( ! innerOverridableProp ) {
		const result = getContainerByOriginId( overridableProp.originPropFields.elementId, intermediateInstance.id );
		return { container: result, collectedOverrides: mergedOverrides };
	}

	const nextOverride = getMatchingOverride( intermediateOverrides ?? [], innerInfo.innerOverrideKey );

	return resolveElementOverridesChain(
		innerOverridableProp,
		intermediateInstance.id,
		nextOverride,
		mergedOverrides,
		depth + 1
	);
}

function collectOverridesFromLevel(
	existing: CollectedOverride[],
	levelOverrides: NonNullable< ReturnType< typeof componentInstanceOverridesPropTypeUtil.extract > >
): CollectedOverride[] {
	const result = [ ...existing ];
	const existingInnermostKeys = new Set( existing.map( ( o ) => o.innermostKey ) );

	for ( const override of levelOverrides ) {
		const overridableValue = componentOverridablePropTypeUtil.extract( override );

		if ( overridableValue ) {
			const innerOverride = componentInstanceOverridePropTypeUtil.extract( overridableValue.origin_value );

			if ( ! innerOverride ) {
				continue;
			}

			const innermostKey = innerOverride.override_key;
			const outermostKey = overridableValue.override_key;

			if ( innermostKey && ! existingInnermostKeys.has( innermostKey ) ) {
				result.push( { innermostKey, outermostKey, value: innerOverride.override_value } );
				existingInnermostKeys.add( innermostKey );
			}
		} else {
			const key = override.value.override_key;
			const value = resolveOverridePropValue( override );

			if ( key && ! existingInnermostKeys.has( key ) ) {
				result.push( { innermostKey: key, outermostKey: key, value } );
				existingInnermostKeys.add( key );
			}
		}
	}

	return result;
}
