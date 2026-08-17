import { getDefaultStyleTagFromPreviewElement } from '@elementor/editor-elements';
import {
	__privateUseListenTo as useListenTo,
	commandEndEvent,
	windowEvent,
} from '@elementor/editor-v1-adapters';

export function useDefaultStyleTagFromPreview( elementId: string ) {
	return useListenTo(
		[
			windowEvent( 'elementor/preview/atomic-widget/render' ),
			commandEndEvent( 'document/elements/settings' ),
			commandEndEvent( 'document/elements/set-settings' ),
			commandEndEvent( 'document/elements/select' ),
		],
		() => getDefaultStyleTagFromPreviewElement( elementId )
	);
}
