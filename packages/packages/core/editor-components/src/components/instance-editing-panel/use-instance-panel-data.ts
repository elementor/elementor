import { useElement } from '@elementor/editor-editing-panel';

import { useSanitizeOverridableProps } from '../../hooks/use-sanitize-overridable-props';
import { type ComponentInstanceOverridesPropValue } from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { useComponent } from '../../store/store';
import { type Component, type OverridablePropsGroup } from '../../types';

type InstancePanelData = {
	componentId: number;
	component: Component;
	overrides: ComponentInstanceOverridesPropValue;
	overridableProps: NonNullable< ReturnType< typeof useSanitizeOverridableProps > >;
	groups: OverridablePropsGroup[];
	isEmpty: boolean;
	componentInstanceId: string | undefined;
};

export function useInstancePanelData(): InstancePanelData | null {
	const { element, settings } = useComponentInstanceSettings();

	const componentId = settings?.component_id?.value;

	const overrides = settings?.overrides?.value;

	const component = useComponent( componentId ?? null );

	const componentInstanceId = element?.id;

	const overridableProps = useSanitizeOverridableProps( componentId ?? null, componentInstanceId );

	if ( ! componentId || ! overridableProps || ! component ) {
		return null;
	}

	const isNonEmptyGroup = ( group: OverridablePropsGroup | null ) => group !== null && group.props.length > 0;

	const groups = overridableProps.groups.order
		.map( ( groupId ) => overridableProps.groups.items[ groupId ] ?? null )
		.filter( isNonEmptyGroup );

	const isEmpty = groups.length === 0 || Object.keys( overridableProps.props ).length === 0;

	return { componentId, component, overrides, overridableProps, groups, isEmpty, componentInstanceId };
}

function useComponentInstanceSettings() {
	const { element, settings } = useElement();

	return { element, settings: componentInstancePropTypeUtil.extract( settings.component_instance ) };
}
