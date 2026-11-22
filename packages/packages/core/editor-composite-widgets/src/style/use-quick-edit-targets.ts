import { type ElementID, getContainer, styleRerenderEvents } from '@elementor/editor-elements';
import { type StyleDefinitionID } from '@elementor/editor-styles';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { findWidgetParts } from '../general/find-widget-part';
import { toWidgetPartElement, type WidgetPartElement } from '../general/use-widget-part-elements';
import { getClassesProp, getLocalStyleId } from './update-local-styles';

export type QuickEditTargets = {
	readTarget: WidgetPartElement;
	readStyleId: StyleDefinitionID | null;
	classesProp: string;
	elementIds: ElementID[];
};

export function useQuickEditTargets( rootId: ElementID, parts: string[] ): QuickEditTargets | null {
	return useListenTo(
		[
			...styleRerenderEvents,
			commandEndEvent( 'document/elements/set-settings' ),
			commandEndEvent( 'document/elements/delete' ),
		],
		() => getQuickEditTargets( rootId, parts ),
		[ rootId, parts ]
	);
}

function getQuickEditTargets( rootId: ElementID, parts: string[] ): QuickEditTargets | null {
	const root = getContainer( rootId );

	if ( ! root ) {
		return null;
	}

	const containers = parts.flatMap( ( part ) => findWidgetParts( root, part ) );
	const [ firstContainer ] = containers;
	const readTarget = firstContainer ? toWidgetPartElement( firstContainer ) : null;
	const classesProp = firstContainer ? getClassesProp( firstContainer.id ) : null;

	if ( ! readTarget || ! classesProp ) {
		return null;
	}

	return {
		readTarget,
		readStyleId: getLocalStyleId( firstContainer.id ),
		classesProp,
		elementIds: containers.map( ( container ) => container.id ),
	};
}
