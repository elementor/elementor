import { __privateUseListenTo as useListenTo, commandEndEvent, windowEvent } from '@elementor/editor-v1-adapters';

import { type ExtendedWindow } from '../sync/types';

export function useComputedStyle( elementId: string | null ) {
	return useListenTo(
		[
			windowEvent( 'elementor/device-mode/change' ),
			commandEndEvent( 'document/elements/reset-style' ),
			commandEndEvent( 'document/elements/settings' ),
			commandEndEvent( 'document/elements/paste-style' ),
		],
		() => {
			if ( ! elementId ) {
				return null;
			}

			const extendedWindow: ExtendedWindow = window;
			const element = extendedWindow.elementor?.getContainer?.( elementId );

			if ( ! element?.view?.el ) {
				return null;
			}

			const resp = window.getComputedStyle( element.view.el );
			return resp;
		}
	);
}
