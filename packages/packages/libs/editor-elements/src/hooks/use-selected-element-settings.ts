import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { getElementSettings } from '../sync/get-element-setting';
import { getSelectedElement } from '../sync/get-selected-elements';
import { type Element, type ElementType } from '../types';

type UseSelectedElementSettingsResult< TValue > =
	| {
			element: Element;
			elementType: ElementType;
			settings: Record< string, TValue | null >;
	  }
	| {
			element: null;
			elementType: null;
			settings: null;
	  };

// Use the selected element and it's settings,
// and subscribe to changes on both the selected element and its settings.
// This ensures the element and its settings are synced.
export function useSelectedElementSettings< TValue >(): UseSelectedElementSettingsResult< TValue > {
	return useListenTo(
		[
			commandEndEvent( 'document/elements/select' ),
			commandEndEvent( 'document/elements/deselect' ),
			commandEndEvent( 'document/elements/select-all' ),
			commandEndEvent( 'document/elements/deselect-all' ),
			commandEndEvent( 'document/elements/set-settings' ),
		],
		() => {
			const { element, elementType } = getSelectedElement();

			if ( ! element || ! elementType ) {
				return { element: null, elementType: null, settings: null };
			}

			const settings = getElementSettings< TValue >( element.id, Object.keys( elementType.propsSchema ) );

			return {
				element,
				elementType,
				settings,
			};
		}
	);
}
