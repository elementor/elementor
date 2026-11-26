import { type ElementID, getContainer, type V1Element } from '@elementor/editor-elements';

import { findWidgetPart } from '../../general/find-widget-part';

export type WidgetPartContainers = Partial< Record< string, V1Element > >;

export function getWidgetPartContainers( rootId: ElementID, parts: string[] ): WidgetPartContainers {
	const root = getContainer( rootId );

	if ( ! root ) {
		return {};
	}

	return Object.fromEntries(
		parts.flatMap( ( part ) => {
			const container = findWidgetPart( root, part );

			return container ? [ [ part, container ] ] : [];
		} )
	);
}
