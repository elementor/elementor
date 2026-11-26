import { getAtomicWidgets, type WidgetsCache } from '../utils/get-atomic-widgets';
import { getPromotionTiles } from '../utils/get-promotion-tiles';
import { groupWidgets } from '../utils/group-widgets';

export function getLegacyHiddenTypes( cache: WidgetsCache | null ): Set< string > {
	if ( ! cache ) {
		return new Set();
	}

	const widgets = getAtomicWidgets( cache );

	// Everything the Atomic panel renders is hidden, including its "Atomic Elements" fallback group.
	return new Set(
		groupWidgets( widgets, getPromotionTiles( widgets ) ).flatMap( ( { tiles } ) =>
			tiles.map( ( { widgetType } ) => widgetType )
		)
	);
}
