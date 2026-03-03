import { type ComponentInstanceOverride } from '../prop-types/component-instance-overrides-prop-type';
import { componentInstanceOverridesPropTypeUtil } from '../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';
import { type OverridableProp, type OverridableProps } from '../types';
import { getContainerByOriginId } from './get-container-by-origin-id';
import { getOverridableProp } from './get-overridable-prop';
import { extractInnerOverrideInfo } from './overridable-props-utils';

export function filterValidOverridableProps(
	overridableProps: OverridableProps,
	// instanceElementId is used to find the component inner elements,
	// and should be passed when editing component instance (not in component edit mode)
	instanceElementId?: string
): OverridableProps {
	const validProps: Record< string, OverridableProp > = {};

	for ( const [ key, prop ] of Object.entries( overridableProps.props ) ) {
		if ( isExposedPropValid( prop, instanceElementId ) ) {
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

export function isExposedPropValid( prop: OverridableProp, instanceElementId?: string ): boolean {
	if ( ! prop.originPropFields ) {
		// if no originPropFields - the prop is on the widget level itself, therefore no need to lookup for a corresponding component's overridables
		return true;
	}

	const innerComponentInstanceElement = getContainerByOriginId( prop.elementId, instanceElementId );

	if ( ! innerComponentInstanceElement ) {
		return false;
	}

	const setting = innerComponentInstanceElement.settings?.get( 'component_instance' ) ?? null;
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

	return isExposedPropValid( innerOverridableProp, innerComponentInstanceElement.id );
}

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
