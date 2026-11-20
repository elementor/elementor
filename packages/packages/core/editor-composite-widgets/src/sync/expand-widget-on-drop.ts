import { type DropElementParams } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { prepareWidgetTemplateForInsert } from '../prepare-widget-template-for-insert';
import { getCompositeWidgetDefinition } from './get-composite-widget-definition';

const DROP_COMMAND = 'preview/drop';

type DropArgs = {
	model?: DropElementParams[ 'model' ] & {
		custom?: { compositeWidgetId?: string };
	};
};

export function initExpandWidgetOnDrop() {
	registerDataHook( 'dependency', DROP_COMMAND, ( args: DropArgs ) => expandWidgetOnDrop( args ) );
}

function expandWidgetOnDrop( args: DropArgs ): boolean {
	const widgetId = args.model?.custom?.compositeWidgetId;

	if ( ! widgetId ) {
		return true;
	}

	const definition = getCompositeWidgetDefinition( widgetId );

	if ( ! definition ) {
		return false;
	}

	args.model = prepareWidgetTemplateForInsert( definition ) as DropArgs[ 'model' ];

	return true;
}
