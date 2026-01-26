import { getElementSetting } from '@elementor/editor-elements';

import { componentInstanceOverridesPropTypeUtil } from '../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';
import { type OverridableProp, type OverridableProps } from '../types';

export type GetOverridablePropsForComponent = ( componentId: number ) => OverridableProps | undefined;

type OverrideMapping = {
	overrideKey: string;
	innerOverrideKey: string | null;
};

type ComponentInstanceData = {
	componentId: number;
	overrides: OverrideMapping[];
};

function getComponentInstanceData( elementId: string ): ComponentInstanceData | null {
	const setting = getElementSetting( elementId, 'component_instance' );
	const componentInstance = componentInstancePropTypeUtil.extract( setting );

	if ( ! componentInstance?.component_id?.value ) {
		return null;
	}

	const overridesValue = componentInstanceOverridesPropTypeUtil.extract( componentInstance.overrides );

	const overrides = ( overridesValue ?? [] ).map( ( override ) => {
		const overridableValue = componentOverridablePropTypeUtil.extract( override );

		if ( overridableValue ) {
			const innerOverride = overridableValue.origin_value as { value?: { override_key?: string } } | null;

			return {
				overrideKey: overridableValue.override_key,
				innerOverrideKey: innerOverride?.value?.override_key ?? null,
			};
		}

		return {
			overrideKey: override.value.override_key,
			innerOverrideKey: override.value.override_key,
		};
	} );

	return {
		componentId: componentInstance.component_id.value,
		overrides,
	};
}

export function isExposedPropValid(
	prop: OverridableProp,
	getOverridablePropsForComponent: GetOverridablePropsForComponent,
	visited: Set< string > = new Set()
): boolean {
	if ( ! prop.originPropFields ) {
		return true;
	}

	const visitKey = `${ prop.elementId }:${ prop.overrideKey }`;
	if ( visited.has( visitKey ) ) {
		return false;
	}
	visited.add( visitKey );

	const instanceData = getComponentInstanceData( prop.elementId );
	if ( ! instanceData ) {
		return false;
	}

	const matchingOverride = instanceData.overrides.find( ( o ) => o.overrideKey === prop.overrideKey );
	if ( ! matchingOverride || ! matchingOverride.innerOverrideKey ) {
		return false;
	}

	const innerOverridableProps = getOverridablePropsForComponent( instanceData.componentId );
	if ( ! innerOverridableProps ) {
		return false;
	}

	const innerProp = innerOverridableProps.props[ matchingOverride.innerOverrideKey ];
	if ( ! innerProp ) {
		return false;
	}

	return isExposedPropValid( innerProp, getOverridablePropsForComponent, visited );
}

export function filterValidOverridableProps(
	overridableProps: OverridableProps,
	getOverridablePropsForComponent: GetOverridablePropsForComponent
): OverridableProps {
	const validProps: Record< string, OverridableProp > = {};

	for ( const [ key, prop ] of Object.entries( overridableProps.props ) ) {
		if ( isExposedPropValid( prop, getOverridablePropsForComponent ) ) {
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
