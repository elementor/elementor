import { getAtomicWidgets, type WidgetsCache } from '../utils/get-atomic-widgets';
import { getPromotionTiles } from '../utils/get-promotion-tiles';
import { FALLBACK_GROUP_ID, groupWidgets } from '../utils/group-widgets';

// D1: hide everything the Atomic panel renders, including its "Atomic Elements" fallback group.
export const HIDE_FALLBACK_GROUP = true;

export function getLegacyHiddenTypes( cache: WidgetsCache | null ): Set< string > {
	if ( ! cache ) {
		return new Set();
	}

	const widgets = getAtomicWidgets( cache );

	return new Set(
		groupWidgets( widgets, getPromotionTiles( widgets ) )
			.filter( ( { id } ) => HIDE_FALLBACK_GROUP || id !== FALLBACK_GROUP_ID )
			.flatMap( ( { tiles } ) => tiles.map( ( { widgetType } ) => widgetType ) )
	);
}
