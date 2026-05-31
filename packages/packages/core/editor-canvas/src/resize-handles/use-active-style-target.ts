import { styleRerenderEvents } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { resolveActiveStyleTarget, type ActiveStyleTarget } from './resolve-active-style-target';

export function useActiveStyleTarget( elementId: string ): ActiveStyleTarget | null {
	return useListenTo(
		[ ...styleRerenderEvents, commandEndEvent( 'document/elements/set-settings' ) ],
		() => resolveActiveStyleTarget( elementId ),
		[ elementId ]
	);
}
