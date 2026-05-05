import { getMixpanel } from '@elementor/events';

import { type ConflictStrategy } from './types';

type EventMap = {
	importOpened: object;
	fileSelected: { file_type: string };
	validationFailed: { file_type: string };
	conflictChoice: { choice: ConflictStrategy };
	confirmed: { conflict_choice: ConflictStrategy };
	imported: object;
	importFailed: object;
};

export type DesignSystemTrackingEvent = {
	[ K in keyof EventMap ]: { event: K } & EventMap[ K ];
}[ keyof EventMap ];

const FILE_TYPE_DESIGN_SYSTEM = 'design_system';

export const trackDesignSystem = ( payload: DesignSystemTrackingEvent ) => {
	const { dispatchEvent, config } = getMixpanel();
	const name = config?.names?.design_system?.[ payload.event ];

	if ( ! name ) {
		return;
	}

	const { event, ...eventData } = payload;

	try {
		dispatchEvent?.( name, { event, ...eventData } );
	} catch {
		// Silently ignore tracking errors so they don't break the user flow.
	}
};

export const designSystemFileType = FILE_TYPE_DESIGN_SYSTEM;
