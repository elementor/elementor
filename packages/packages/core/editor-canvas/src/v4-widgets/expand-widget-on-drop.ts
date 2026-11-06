import { prepareWidgetTemplateForInsert, type WidgetDefinitionForInsert } from '@elementor/editor-elements';
import { isExperimentActive, registerDataHook } from '@elementor/editor-v1-adapters';

export const V4_WIDGETS_EXPERIMENT = 'e_v4_widgets';

const DROP_COMMAND = 'preview/drop';

type DropArgs = {
	model?: Record< string, unknown > & {
		custom?: { v4WidgetId?: string };
	};
};

type WindowWithV4Widgets = Window & {
	elementor?: {
		config?: {
			v4Widgets?: Record< string, WidgetDefinitionForInsert >;
		};
	};
};

export function initExpandWidgetOnDrop() {
	if ( ! isExperimentActive( V4_WIDGETS_EXPERIMENT ) ) {
		return;
	}

	registerDataHook( 'dependency', DROP_COMMAND, ( args: DropArgs ) => expandWidgetOnDrop( args ) );
}

function expandWidgetOnDrop( args: DropArgs ): boolean {
	const widgetId = args.model?.custom?.v4WidgetId;

	if ( ! widgetId ) {
		return true;
	}

	const definition = getWidgetDefinition( widgetId );

	if ( ! definition ) {
		return false;
	}

	args.model = prepareWidgetTemplateForInsert( definition );

	return true;
}

function getWidgetDefinition( widgetId: string ): WidgetDefinitionForInsert | null {
	return ( window as unknown as WindowWithV4Widgets ).elementor?.config?.v4Widgets?.[ widgetId ] ?? null;
}
