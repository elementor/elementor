import { getElementClassesProp, getElementLocalStyle } from '@elementor/editor-editing-panel';
import { type ElementID, type V1Element } from '@elementor/editor-elements';
import { type StyleDefinitionID } from '@elementor/editor-styles';

import { toWidgetPartElement, type WidgetPartElement } from '../general/use-widget-part-elements';
import { useWidgetPartContainers } from './use-widget-part-containers';

export type QuickEditTargets = {
	readTarget: WidgetPartElement;
	readStyleId: StyleDefinitionID | null;
	classesProp: string;
	elementIds: ElementID[];
};

export function useQuickEditTargets( rootId: ElementID, parts: string[] ): QuickEditTargets | null {
	const partContainers = useWidgetPartContainers( rootId, parts );

	return getQuickEditTargets(
		parts.flatMap( ( part ) => {
			const container = partContainers[ part ];

			return container ? [ container ] : [];
		} )
	);
}

function getQuickEditTargets( containers: V1Element[] ): QuickEditTargets | null {
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
