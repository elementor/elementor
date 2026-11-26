import { type ExtendedWindow } from '../types';
import { type WidgetsCache } from './get-atomic-widgets';
import { type PromotionTile } from './group-widgets';

export function getPromotionTiles( registeredWidgets: WidgetsCache ): PromotionTile[] {
	const promotions = ( window as unknown as ExtendedWindow ).elementor?.config?.atomicWidgetPromotions ?? [];

	return promotions.flatMap( ( { type, widgets = [] } ) =>
		widgets
			.filter( ( { name } ) => ! registeredWidgets[ name ] )
			.map( ( widget ) => ( {
				tile: {
					elType: 'widget',
					widgetType: widget.name,
					title: widget.title,
					icon: widget.icon,
					promotionType: type,
				},
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
