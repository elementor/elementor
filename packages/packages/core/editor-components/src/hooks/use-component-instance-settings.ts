import { useElement } from '@elementor/editor-editing-panel';
import { useElementSetting } from '@elementor/editor-elements';

import {
	componentInstancePropTypeUtil,
	type ComponentInstancePropValue,
} from '../prop-types/component-instance-prop-type';

export function useComponentInstanceSettings() {
	const { element } = useElement();

	const settings = useElementSetting< ComponentInstancePropValue >( element.id, 'component_instance' );

	return componentInstancePropTypeUtil.extract( settings );
}
