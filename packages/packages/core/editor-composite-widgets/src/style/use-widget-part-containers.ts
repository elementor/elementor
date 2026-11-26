import { type ElementID, getContainer, styleRerenderEvents, type V1Element } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { findWidgetPart } from '../general/find-widget-part';

export type WidgetPartContainers = Partial< Record< string, V1Element > >;

export function useWidgetPartContainers( rootId: ElementID, parts: string[] ): WidgetPartContainers {
	return useListenTo(
		[
			...styleRerenderEvents,
			commandEndEvent( 'document/elements/set-settings' ),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
		],
		() => getWidgetPartContainers( rootId, parts ),
		[ rootId, parts ]
	);
}

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
