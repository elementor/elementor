import { type V1ElementConfig } from '@elementor/editor-elements';

type WidgetConfig = V1ElementConfig< {
	categories?: string[];
	keywords?: string[];
	editable?: boolean;
	hide_on_search?: boolean;
	deprecation?: { replacement?: string };
	custom?: { isPreset?: boolean; preset_settings?: Record< string, unknown > };
} >;
export type WidgetsCache = Record< string, WidgetConfig >;

const EXCLUDED_CATEGORIES = [ 'angie-widgets', 'custom-widgets' ];

export function getAtomicWidgets( cache: WidgetsCache | null ): WidgetsCache {
	const resolvedCache = cache ?? {};

	return Object.fromEntries(
		Object.entries( resolvedCache ).filter( ( [ , widget ] ) => isListed( widget, resolvedCache ) )
	);
}

function isListed( widget: WidgetConfig, cache: WidgetsCache ) {
	return (
		widget.atomic === true &&
		!! widget.title &&
		widget.show_in_panel !== false &&
		! isReplaced( widget, cache ) &&
		! widget.categories?.some( ( category ) => EXCLUDED_CATEGORIES.includes( category ) )
	);
}

function isReplaced( widget: WidgetConfig, cache: WidgetsCache ) {
	const replacement = widget.deprecation?.replacement;

	return !! replacement && !! cache[ replacement ];
}
