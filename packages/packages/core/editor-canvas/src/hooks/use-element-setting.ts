import { type ElementID, getElementSetting } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

export function useElementSetting< TValue >( id: ElementID, key: string ): TValue | null {
	return useListenTo( commandEndEvent( 'document/elements/set-settings' ), () =>
		getElementSetting< TValue >( id, key )
	);
}
