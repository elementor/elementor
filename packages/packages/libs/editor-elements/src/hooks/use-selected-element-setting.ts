import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { getElementSetting, getElementSettings } from '../sync/get-element-setting';
import { getSelectedElement } from '../sync/get-selected-elements';
import { type Element, type ElementType } from '../types';

type UseSelectedElementSettingResult< TValue > =
	| {
			element: Element;
			elementType: ElementType;
			setting: TValue | null;
	  }
	| {
			element: null;
			elementType: null;
			setting: null;
	  };
/**
 * Get the selected element along with a specific setting value.
 * This ensures the element and its settings are synchronized.
 * @param settingKey
 */
export function useSelectedElementSetting< TValue >(
	settingKey: string
): UseSelectedElementSettingResult< TValue > | null {
	return useListenTo(
		getEventsForSelectedElementSettings(),
		() => {
			const { element, elementType } = getSelectedElement();

			if ( ! element || ! elementType ) {
				return { element: null, elementType: null, setting: null };
			}

			const setting = getElementSetting< TValue >( element.id, settingKey );

			return {
				element,
				elementType,
				setting,
			};
		},
		[ settingKey ]
	);
}

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

export function useSelectedElementSettings< TValue >(): UseSelectedElementSettingsResult< TValue > {
	return useListenTo(
		getEventsForSelectedElementSettings(),
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
		},
		[]
	);
}

function getEventsForSelectedElementSettings() {
	return [
		commandEndEvent( 'document/elements/select' ),
		commandEndEvent( 'document/elements/deselect' ),
		commandEndEvent( 'document/elements/select-all' ),
		commandEndEvent( 'document/elements/deselect-all' ),
		commandEndEvent( 'document/elements/set-settings' ),
	];
}
