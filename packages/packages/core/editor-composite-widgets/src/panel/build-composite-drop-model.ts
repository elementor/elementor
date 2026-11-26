import { type CompositeWidgetDefinition } from '../types';

export function buildCompositeDropModel( definition: CompositeWidgetDefinition ) {
	const { elType } = definition.template;

	return {
		elType,
		custom: { originalWidget: elType, compositeWidgetId: definition.id },
	};
}
