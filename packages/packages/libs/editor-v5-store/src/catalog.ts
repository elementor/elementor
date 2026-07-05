import type { AtomicWidgetConfig } from './types';

type ElementorConfigWindow = Window & {
	ElementorConfig?: {
		initial_document?: {
			widgets?: Record< string, AtomicWidgetConfig >;
		};
		widgets?: Record< string, AtomicWidgetConfig >;
	};
};

function getWidgetsRecord(): Record< string, AtomicWidgetConfig > {
	const config = ( window as ElementorConfigWindow ).ElementorConfig;

	return config?.widgets ?? config?.initial_document?.widgets ?? {};
}

export function getAtomicCatalog(): AtomicWidgetConfig[] {
	return Object.values( getWidgetsRecord() ).filter(
		( widget ) => widget.atomic_controls && widget.atomic_props_schema
	);
}

export function getAtomicWidgetConfig( name: string ): AtomicWidgetConfig | undefined {
	const widget = getWidgetsRecord()[ name ];

	if ( ! widget?.atomic_controls || ! widget?.atomic_props_schema ) {
		return undefined;
	}

	return widget;
}
