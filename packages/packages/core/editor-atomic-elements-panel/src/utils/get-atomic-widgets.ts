import { type V1ElementConfig } from '@elementor/editor-elements';

type WidgetConfig = V1ElementConfig< { categories?: string[]; deprecation?: { replacement?: string } } >;
export type WidgetsCache = Record< string, WidgetConfig >;

const EXCLUDED_CATEGORIES = [ 'angie-widgets', 'custom-widgets' ];

export function getAtomicWidgets( cache: WidgetsCache | null ): WidgetsCache {
	return Object.fromEntries(
		Object.entries( cache ?? {} ).filter( ( [ , widget ] ) => isListed( widget, cache as WidgetsCache ) )
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
