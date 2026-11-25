import { type Element, getContainer } from '@elementor/editor-elements';

import { isRegisteredWidgetRoot } from './find-locking-widget-root';

export function isSelectedWidgetRoot( element: Element ): boolean {
	const container = getContainer( element.id );

	return !! container && isRegisteredWidgetRoot( container );
}
