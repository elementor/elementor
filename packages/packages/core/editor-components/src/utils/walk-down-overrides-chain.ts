import { type V1Element } from '@elementor/editor-elements';

import { type OverridesMapping } from '../components/instance-editing-panel/utils/resolve-element-settings';
import {
	type ComponentInstanceOverrideProp,
	componentInstanceOverridePropTypeUtil,
} from '../prop-types/component-instance-override-prop-type';
import {
	type ComponentInstanceOverride,
	componentInstanceOverridesPropTypeUtil,
} from '../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';
import { type OverridableProp } from '../types';
import { getContainerByOriginId } from './get-container-by-origin-id';
import { getOverridableProp } from './get-overridable-prop';

type OverridesChainResult =
	| {
			isChainBroken: false;
			innerElement: V1Element;
			overridesMapping: OverridesMapping;
	  }
	| {
			isChainBroken: true;
	  };

/**
 * Recursively walks down a chain of nested component instances to find the inner element
 * and get the overrides mapping for it.
 *
 * Returns a discriminated union: either the resolved inner element with its overrides mapping,
 * or `{ isChainBroken: true }` if at least one of the levels is not overridable anymore.
 *
 * @param params
 * @param params.upperLevelOverridableProp - The overridable prop metadata at the current level.
 * @param params.upperInstanceId           - Runtime ID of the parent instance to scope lookups.
 * @param params.overridesMapping          - Accumulated overrides from upper levels.
 * @param params.depth                     - Current recursion depth.
 */
export function walkDownOverridesChain( {
	upperLevelOverridableProp,
	upperInstanceId,
	overridesMapping = {},
	depth = 0,
}: {
	upperLevelOverridableProp: OverridableProp;
	upperInstanceId?: string;
	overridesMapping?: OverridesMapping;
	depth?: number;
} ): OverridesChainResult {
	// Stop condition: no originPropFields means we've reached the most inner component instance
	if ( ! upperLevelOverridableProp.originPropFields ) {
		const innerElement = getContainerByOriginId( upperLevelOverridableProp.elementId, upperInstanceId );

		if ( ! innerElement ) {
			throw new Error(
				`Inner element not found inside instance. elementId: ${ upperLevelOverridableProp.elementId }, instanceId: ${ upperInstanceId }`
			);
		}

		return { isChainBroken: false, innerElement, overridesMapping };
	}

	// Step 1: Find the intermediate component instance and read its settings.
	const currentInstance = getContainerByOriginId( upperLevelOverridableProp.elementId, upperInstanceId );
	if ( ! currentInstance ) {
		// One of the instances in the chain was deleted.
		return { isChainBroken: true };
	}
	const { componentId, overrides } = extractComponentInstanceSettings( currentInstance );

	if ( ! componentId ) {
		throw new Error(
			`Component ID not found for current instance. currentInstanceId: ${ currentInstance.id }. upperInstanceId: ${ upperInstanceId }`
		);
	}

	// Collect overrides from this level, translating keys for exposed-further props.
	const mergedOverrides = collectOverridesFromLevel( overridesMapping, overrides ?? [] );

	// Find the overridable-override that matches the upper overridable prop's key,
	// to get the next level's overridable prop.
	const override = findOverrideByOuterKey( overrides, upperLevelOverridableProp.overrideKey );
	const overrideKey = componentInstanceOverridePropTypeUtil.extract( override )?.override_key;

	if ( ! override || ! overrideKey ) {
		// No matching override found for the current level - it means it's no longer overridable.
		return { isChainBroken: true };
	}

	const overridableProp = getOverridableProp( { componentId, overrideKey } );

	if ( ! overridableProp ) {
		throw new Error( `Overridable prop not found. componentId: ${ componentId }, overrideKey: ${ overrideKey }` );
	}

	// Step 4: Recurse into the next nesting level.
	return walkDownOverridesChain( {
		upperLevelOverridableProp: overridableProp,
		upperInstanceId: currentInstance.id,
		overridesMapping: mergedOverrides,
		depth: depth + 1,
	} );
}

/**
 * Collects overrides from an intermediate instance level into the accumulated mapping.
 *
 * For exposed-further overrides (overridable wrapping an override), we have outer key (overridable's) and inner key (override's).
 * If a higher level already set a value for the outer key, that value is carried forward to the inner key
 * — same logic as the componentOverridableTransformer in the render pipeline.
 *
 * For simple overrides, that are not exposed further, we just use the override's key and value.
 *
 * @param existing       - Previously accumulated overrides from upper levels.
 * @param levelOverrides - The overrides array from the current level instance.
 */
function collectOverridesFromLevel(
	existing: OverridesMapping,
	levelOverrides: ComponentInstanceOverride[]
): OverridesMapping {
	const result: OverridesMapping = { ...existing };

	for ( const item of levelOverrides ) {
		const overridableValue = componentOverridablePropTypeUtil.extract( item );

		if ( overridableValue ) {
			// Exposed-further: overridable wraps an inner override with a different key.
			const override = componentInstanceOverridePropTypeUtil.extract( overridableValue.origin_value );

			if ( ! override ) {
				continue;
			}

			const outerKey = overridableValue.override_key;
			const innerKey = override.override_key;
			const innerValue = override.override_value;

			// If an upper level already set a value for the outer key, carry it forward to the inner key.
			const higherLevelOverride = existing[ outerKey ];

			if ( higherLevelOverride ) {
				const outerValue = higherLevelOverride.value;
				result[ innerKey ] = {
					value: outerValue ?? innerValue,
					outermostKey: higherLevelOverride.outermostKey ?? outerKey,
				};
				continue;
			}

			result[ innerKey ] = {
				value: innerValue,
				outermostKey: outerKey,
			};
		} else {
			// Simple override: not exposed further, we just store the override's key and value.
			const override = componentInstanceOverridePropTypeUtil.extract( item.value );

			if ( ! override ) {
				continue;
			}

			const key = override.override_key;
			const value = override.override_value;

			result[ key ] = { value };
		}
	}

	return result;
}

function extractComponentInstanceSettings( element: V1Element ) {
	const instanceSetting = element.settings?.get( 'component_instance' );
	const instanceValue = componentInstancePropTypeUtil.extract( instanceSetting );
	const componentId = instanceValue?.component_id?.value;
	const overrides = componentInstanceOverridesPropTypeUtil.extract( instanceValue?.overrides );

	return { componentId, overrides };
}

// Finds the inner override prop whose wrapping overridable matches the given outer key.
function findOverrideByOuterKey(
	overrides: ComponentInstanceOverride[] | null | undefined,
	outerKey: string
): ComponentInstanceOverrideProp | null {
	if ( ! overrides ) {
		return null;
	}

	const overridableOverride: ComponentInstanceOverride | undefined = overrides.find( ( item ) => {
		const overridableValue = componentOverridablePropTypeUtil.extract( item );
		if ( ! overridableValue ) {
			return false;
		}
		return overridableValue.override_key === outerKey;
	} );

	const override = componentOverridablePropTypeUtil.extract( overridableOverride )?.origin_value;

	if ( ! override || ! componentInstanceOverridePropTypeUtil.isValid( override ) ) {
		return null;
	}

	return override;
}
