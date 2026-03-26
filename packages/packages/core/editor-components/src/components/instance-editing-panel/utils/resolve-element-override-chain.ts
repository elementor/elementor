import { getElementSetting, type V1Element } from '@elementor/editor-elements';

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
import { resolveOverridePropValue } from '../../../utils/resolve-override-prop-value';
import { type OverridesMapping, type OverridesMapping as PartialOverridesMapping } from './resolve-element-settings';

// type OverridesMapping = Required< PartialOverridesMapping >;

type InnerElementResult = {
	element: V1Element | null;
	overridesMapping: OverridesMapping;
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
 * @param params.upperLevelOverride        - The override at the current level that matches this prop (if any).
 * @param params.scopeElementId            - The runtime ID of the parent element to scope the container lookup.
 * @param params.overridesMapping          - Accumulated overrides from previous (deeper) levels.
 * @param params.depth                     - Current recursion depth (for debugging).
 * @return The innermost element container and an array of collected intermediate overrides,
 *         each mapping an innermostKey (the element's override_key) to an outermostKey
 *         (the one-level-in key used by the editing level's overrides).
 */
export function resolveElementOverridesChain( {
	upperLevelOverridableProp,
	upperLevelOverride,
	scopeElementId,
	overridesMapping = {},
	depth = 0,
}: {
	upperLevelOverridableProp: OverridableProp;
	upperLevelOverride: ComponentInstanceOverride | null;
	scopeElementId: string;
	overridesMapping?: OverridesMapping;
	depth?: number;
} ): InnerElementResult {
	const prefix = `[resolveElementOverridesChain depth=${ depth }]`;

	console.log( prefix, {
		scopeElementId,
		'upperLevelOverridableProp.elementId': upperLevelOverridableProp.elementId,
		'upperLevelOverridableProp.overrideKey': upperLevelOverridableProp.overrideKey,
		hasOriginPropFields: !! upperLevelOverridableProp.originPropFields,
		'upperLevelOverridableProp.originPropFields?.elementId': upperLevelOverridableProp.originPropFields?.elementId,
		upperLevelOverride,
		overridesMapping,
	} );
	// Base case: prop is not exposed further — it belongs directly to an element in this scope.
	if ( ! upperLevelOverridableProp.originPropFields ) {
		const element = getContainerByOriginId( upperLevelOverridableProp.elementId, scopeElementId );
		console.log( prefix, 'BASE CASE - direct prop, found:', element?.id ?? null );
		return { element, overridesMapping };
	}

	// Step 1: Find the component instance at this nesting level.
	const currentInstance = getContainerByOriginId( upperLevelOverridableProp.elementId, scopeElementId );
	console.log( prefix, 'currentInstance:', currentInstance?.id ?? null );
	if ( ! currentInstance ) {
		throw new Error( 'Current instance not found' );
		console.log( prefix, 'FAILED - currentInstance not found' );
		return { element: null, overridesMapping };
	}

	// Step 2: Read the instance's component_instance setting to get its component ID and overrides.
	const currentInstanceSetting = getElementSetting( currentInstance.id, 'component_instance' );
	const currentInstanceValue = componentInstancePropTypeUtil.extract( currentInstanceSetting );
	const currentComponentId = currentInstanceValue?.component_id?.value;
	const currentOverrides = componentInstanceOverridesPropTypeUtil.extract( currentInstanceValue?.overrides );

	// Step 3: Collect overrides from this intermediate level (translating keys for exposed-further props).
	const mergedOverrides = collectOverridesFromLevel( overridesMapping, currentOverrides ?? [] );

	// Step 4: Get matching overridable-override
	const overridableOverride: ComponentInstanceOverride | undefined = currentOverrides?.find( ( item ) => {
		const overridableValue = componentOverridablePropTypeUtil.extract( item );
		if ( ! overridableValue ) {
			return false;
		}
		return overridableValue.override_key === upperLevelOverridableProp.overrideKey;
	} );
	const overrideInfo = extractInnerOverrideInfo( overridableOverride ?? null );

	if ( ! currentComponentId || ! overrideInfo ) {
		throw new Error( 'Override info not found' );
		//throw?
		// Can't recurse further — resolve the element directly within this instance.
		const element = getContainerByOriginId(
			upperLevelOverridableProp.originPropFields.elementId,
			currentInstance.id
		);
		console.log( prefix, 'BASE CASE - overrideInfo not found, found:', element?.id ?? null );
		return { element, overridesMapping: mergedOverrides };
	}

	// Step 5: Look up the overridable prop metadata for the next level down.

	const override = componentInstanceOverridePropTypeUtil.create( {
		override_key: overrideInfo.innerOverrideKey,
		override_value: overrideInfo.overrideValue,
		schema_source: {
			type: 'component',
			id: overrideInfo.componentId,
		},
	} );
	const overridableProp = getOverridableProp( {
		componentId: currentComponentId,
		overrideKey: overrideInfo.innerOverrideKey,
	} );

	if ( ! overridableProp ) {
		throw new Error( 'Overridable prop not found' );
	}

	// Step 6: Recurse into the next nesting level.
	console.log( prefix, 'nextOverride:', override );
	return resolveElementOverridesChain( {
		upperLevelOverridableProp: overridableProp,
		upperLevelOverride: override,
		scopeElementId: currentInstance.id,
		overridesMapping: mergedOverrides,
		depth: depth + 1,
	} );
}

/**
 * Merges overrides from a single intermediate instance level into the accumulated overrides.
 *
 * Each override at this level can be either:
 * - An "exposed further" override (overridable wrapping an override): the outer key and inner key differ,
 *   so we translate from the inner override's key (innermostKey) to the overridable's key (outermostKey).
 * - A simple override: the key is the same at both levels (innermostKey === outermostKey).
 *
 * Earlier (deeper) overrides take precedence — if an innermostKey was already collected,
 * it is not overwritten by a shallower level.
 *
 * @param existing       - Previously accumulated overrides from deeper levels.
 * @param levelOverrides - The overrides array from the current intermediate instance.
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
