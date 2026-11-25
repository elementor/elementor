import { getElementClassesProp, getElementLocalStyle } from '@elementor/editor-editing-panel';
import { type ElementID, getContainer, styleRerenderEvents, type V1Element } from '@elementor/editor-elements';
import { type StyleDefinitionID } from '@elementor/editor-styles';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { findWidgetPart } from '../general/find-widget-part';
import { toWidgetPartElement, type WidgetPartElement } from '../general/use-widget-part-elements';

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

	const containers = parts
		.map( ( part ) => findWidgetPart( root, part ) )
		.filter( ( container ): container is V1Element => !! container );
	const [ firstContainer ] = containers;
	const readTarget = firstContainer ? toWidgetPartElement( firstContainer ) : null;
	const classesProp = firstContainer ? getElementClassesProp( firstContainer.id ) : null;

	if ( ! readTarget || ! classesProp ) {
		return null;
	}

	return {
		readTarget,
		readStyleId: getElementLocalStyle( firstContainer.id )?.styleId ?? null,
		classesProp,
		elementIds: containers.map( ( container ) => container.id ),
	};
}
