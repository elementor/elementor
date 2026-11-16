import { type CompositeWidgetDefinition } from '../types';

type WindowWithCompositeWidgets = Window & {
	elementor?: {
		config?: {
			compositeWidgets?: Record< string, CompositeWidgetDefinition >;
		};
	};
};

export function getCompositeWidgetDefinition( widgetId: string ): CompositeWidgetDefinition | null {
	return (
		( window as unknown as WindowWithCompositeWidgets ).elementor?.config?.compositeWidgets?.[ widgetId ] ?? null
	);
}
