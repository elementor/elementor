import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { getWidgetsCache } from './get-widgets-cache';

export function getElementIcon( elementId: ElementID ): string | null {
	const container = getContainer( elementId );
	const type = container?.model.get( 'widgetType' ) || container?.model.get( 'elType' );

	if ( ! type ) {
		return null;
	}

	return getWidgetsCache()?.[ type ]?.icon ?? null;
}
