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
 * Walks through a chain of nested component instances to find the innermost element
 * and collect intermediate override values along the way.
 *
 * For "exposed further" props (where an inner component's prop is overridable from an outer component),
 * the override chain can span multiple nesting levels. This function recursively follows
 * the chain from the outermost overridable prop down to the actual element, collecting
 * override values set at each intermediate instance level (excluding the outermost editing level).
 * @param params
 * @param params.upperLevelOverridableProp - The overridable prop metadata at the current nesting level.
 * @param params.upperInstanceId           - The runtime ID of the parent element to scope the container lookup.
 * @param params.overridesMapping          - Accumulated overrides from previous (upper) levels.
 * @param params.depth                     - Current recursion depth (for debugging).
 * @return The innermost element container and an array of collected intermediate overrides,
 *         each mapping an innermostKey (the element's override_key) to an outermostKey
 *         (the one-level-in key used by the editing level's overrides).
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
	try {
		// Stop condition: if no originPropFields, we've reached the innermost component instance
		if ( ! upperLevelOverridableProp.originPropFields ) {
			const innerElement = getContainerByOriginId( upperLevelOverridableProp.elementId, upperInstanceId );

			if ( ! innerElement ) {
				throw new Error(
					`Inner element not found inside instance. elementId: ${ upperLevelOverridableProp.elementId }, instanceId: ${ upperInstanceId }`
				);
			}

			return { isChainBroken: false, innerElement, overridesMapping };
		}

		// Get the component instance at this nesting level and its settings.
		const currentInstance = getContainerByOriginId( upperLevelOverridableProp.elementId, upperInstanceId );
		if ( ! currentInstance ) {
			throw new Error(
				`Current instance not found inside upper instance. currentInstanceId: ${ upperLevelOverridableProp.elementId }, upperInstanceId: ${ upperInstanceId }`
			);
		}
		const { componentId, overrides } = extractComponentInstanceSettings( currentInstance );

		// Collect overrides from this level (translating keys for exposed-further props).
		const mergedOverrides = collectOverridesFromLevel( overridesMapping, overrides ?? [] );

		// Get overridable prop for the next level down.
		const override = findOverrideByOuterKey( overrides, upperLevelOverridableProp.overrideKey );
		const overrideKey = componentInstanceOverridePropTypeUtil.extract( override )?.override_key;

		if ( ! componentId || ! override || ! overrideKey ) {
			throw new Error(
				`Override not found. componentId: ${ componentId }, overrideKey: ${
					upperLevelOverridableProp.overrideKey
				}, overrides: ${ JSON.stringify( overrides ) }`
			);
		}

		const overridableProp = getOverridableProp( { componentId, overrideKey } );

		if ( ! overridableProp ) {
			throw new Error(
				`Overridable prop not found. componentId: ${ componentId }, overrideKey: ${ overrideKey }`
			);
		}

		// Recurse into the next nesting level.
		return walkDownOverridesChain( {
			upperLevelOverridableProp: overridableProp,
			upperInstanceId: currentInstance.id,
			overridesMapping: mergedOverrides,
			depth: depth + 1,
		} );
	} catch {
		return { isChainBroken: true };
	}
}

/**
 * Merges overrides from a single intermediate instance level into the accumulated overrides.
 *
 * Each override at this level can be either:
 * - An "exposed further" override (overridable wrapping an override): the outer key and inner key differ,
 *   so we translate from the inner override's key (innermostKey) to the overridable's key (outermostKey).
 * - A simple override: the key is the same at both levels (innermostKey === outermostKey).
 *
 * Earlier (upper) overrides take precedence — if an innermostKey was already collected,
 * it is not overwritten by a shallower level.
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
			const override = componentInstanceOverridePropTypeUtil.extract( overridableValue.origin_value );

			if ( ! override ) {
				continue;
			}

			const higherLevelOverrideKey = overridableValue.override_key;
			const higherLevelOverride = existing[ higherLevelOverrideKey ];
			if ( higherLevelOverride ) {
				result[ override.override_key ] = {
					value: higherLevelOverride.value ?? override.override_value,
					outermostKey: higherLevelOverride.outermostKey ?? higherLevelOverrideKey,
				};
				continue;
			}

			result[ override.override_key ] = {
				value: override.override_value,
				outermostKey: higherLevelOverrideKey,
			};
		} else {
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
