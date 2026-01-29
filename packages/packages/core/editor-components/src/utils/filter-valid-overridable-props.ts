import { getElementSetting } from '@elementor/editor-elements';

import { getOverridableProp } from '../components/overridable-props/utils/get-overridable-prop';
import { type ComponentInstanceOverride } from '../prop-types/component-instance-overrides-prop-type';
import { componentInstanceOverridesPropTypeUtil } from '../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';
import { type OverridableProp, type OverridableProps } from '../types';
import { extractInnerOverrideInfo } from './overridable-props-utils';

function findOverrideByOuterKey(
	overrides: ComponentInstanceOverride[] | undefined,
	outerKey: string
): ComponentInstanceOverride | null {
	if ( ! overrides ) {
		return null;
	}

	return (
		overrides.find( ( override ) => {
			const overridableValue = componentOverridablePropTypeUtil.extract( override );

			if ( overridableValue ) {
				return overridableValue.override_key === outerKey;
			}

			return override.value.override_key === outerKey;
		} ) ?? null
	);
}

export function isExposedPropValid( prop: OverridableProp, visited: Set< string > = new Set() ): boolean {
	if ( ! prop.originPropFields ) {
		return true;
	}

	const visitKey = `${ prop.elementId }:${ prop.overrideKey }`;
	if ( visited.has( visitKey ) ) {
		return false;
	}
	visited.add( visitKey );

	const setting = getElementSetting( prop.elementId, 'component_instance' );
	const componentInstance = componentInstancePropTypeUtil.extract( setting );

	if ( ! componentInstance?.component_id?.value ) {
		return false;
	}

	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance.overrides ) ?? undefined;
	const matchingOverride = findOverrideByOuterKey( overrides, prop.overrideKey );
	const innerOverrideInfo = extractInnerOverrideInfo( matchingOverride );

	if ( ! innerOverrideInfo ) {
		return false;
	}

	const { componentId, innerOverrideKey } = innerOverrideInfo;
	const innerOverridableProp = getOverridableProp( { componentId, overrideKey: innerOverrideKey } );

	if ( ! innerOverridableProp ) {
		return false;
	}

	return isExposedPropValid( innerOverridableProp, visited );
}

export function filterValidOverridableProps( overridableProps: OverridableProps ): OverridableProps {
	const validProps: Record< string, OverridableProp > = {};

	for ( const [ key, prop ] of Object.entries( overridableProps.props ) ) {
		if ( isExposedPropValid( prop ) ) {
			validProps[ key ] = prop;
		}
	}

	const validPropKeys = new Set( Object.keys( validProps ) );
	const filteredGroups = {
		items: Object.fromEntries(
			Object.entries( overridableProps.groups.items ).map( ( [ groupId, group ] ) => [
				groupId,
				{ ...group, props: group.props.filter( ( propKey ) => validPropKeys.has( propKey ) ) },
			] )
		),
		order: overridableProps.groups.order,
	};

	return { props: validProps, groups: filteredGroups };
}
