import { type WidgetsCache } from './get-atomic-widgets';
import { type ElementTile } from './group-widgets';

type PromotionWidget = {
	name: string;
	title: string;
	icon?: string;
	categories?: string;
};

type AtomicWidgetPromotion = {
	type: string;
	widgets?: PromotionWidget[];
};

type ExtendedWindow = Window & {
	elementor?: { config?: { atomicWidgetPromotions?: AtomicWidgetPromotion[] } };
};

export function getPromotionTiles( registeredWidgets: WidgetsCache ): ElementTile[] {
	const promotions = ( window as ExtendedWindow ).elementor?.config?.atomicWidgetPromotions ?? [];

	return promotions.flatMap( ( { type, widgets = [] } ) =>
		widgets
			.filter( ( { name } ) => ! registeredWidgets[ name ] )
			.map( ( widget ) => ( {
				elType: 'widget',
				widgetType: widget.name,
				title: widget.title,
				icon: widget.icon,
				promotionType: type,
				categories: parseCategories( widget.categories ),
			} ) )
	);
}

function parseCategories( categories?: string ): string[] {
	try {
		return JSON.parse( categories ?? '[]' );
	} catch {
		return [];
	}
}
