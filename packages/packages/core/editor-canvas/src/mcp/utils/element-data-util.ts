import { getWidgetsCache, type V1ElementConfig } from '@elementor/editor-elements';

export type AvailableWidget = {
	type: string;
	version: string;
	description?: string;
};

export function hasV3Controls( controls: unknown ): boolean {
	return typeof controls === 'object' && controls !== null && Object.keys( controls ).length > 0;
}

export function isWidgetAvailableForLLM( config: V1ElementConfig | undefined ): boolean {
	if ( ! config ) {
		return false;
	}
	if ( config.meta?.llm_support === false ) {
		return false;
	}
	if ( config.atomic_props_schema ) {
		return true;
	}
	return hasV3Controls( config.controls );
}

export function getWidgetVersion( config: V1ElementConfig | undefined ): string {
	return config?.atomic_props_schema ? 'v4' : 'v3';
}

export function getAvailableWidgets(): AvailableWidget[] {
	const cache = getWidgetsCache() ?? {};

	return Object.keys( cache )
		.filter( ( widgetType ) => isWidgetAvailableForLLM( cache[ widgetType ] ) )
		.sort()
		.map( ( widgetType ) => {
			const config = cache[ widgetType ];
			const description = typeof config?.meta?.description === 'string' ? config.meta.description : undefined;

			return {
				type: widgetType,
				version: getWidgetVersion( config ),
				...( description && { description } ),
			};
		} );
}
