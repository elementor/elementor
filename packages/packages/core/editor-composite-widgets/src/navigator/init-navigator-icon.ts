import { WIDGET_MARKER_KEYS } from '@elementor/editor-elements';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

export const NAVIGATOR_ICON_FILTER = 'navigator/element/icon';
export const COMPOSITE_WIDGET_ICON = 'eicon-composite-widgets';

type ElementModel = { get: ( key: string ) => unknown };

type NavigatorIconFilter = ( icon: string, model: ElementModel ) => string;

type WindowWithHooks = {
	elementor?: {
		hooks?: {
			addFilter: ( name: string, callback: NavigatorIconFilter ) => void;
		};
	};
};

export function initNavigatorIcon() {
	// The Structure panel may render its rows before v1 is ready, so register as early as the hooks exist.
	if ( registerNavigatorIconFilter() ) {
		return;
	}

	listenTo( v1ReadyEvent(), () => {
		registerNavigatorIconFilter();
	} );
}

export function resolveNavigatorIcon( icon: string, model: ElementModel ): string {
	return model.get( WIDGET_MARKER_KEYS.widget ) ? COMPOSITE_WIDGET_ICON : icon;
}

function registerNavigatorIconFilter(): boolean {
	const hooks = ( window as unknown as WindowWithHooks ).elementor?.hooks;

	if ( ! hooks?.addFilter ) {
		return false;
	}

	hooks.addFilter( NAVIGATOR_ICON_FILTER, resolveNavigatorIcon );

	return true;
}
