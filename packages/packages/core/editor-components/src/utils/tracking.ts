import { getMixpanel } from '@elementor/mixpanel';

type ComponentEventData = Record< string, unknown > & {
	action: 'createClicked' | 'createCancelled' | 'instanceAdded' | 'sameSessionReuse';
};

export const trackComponentEvent = ( { action, ...data }: ComponentEventData ) => {
	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.components?.[ action ] ) {
		return;
	}

	const name = config.names.components[ action ];
	dispatchEvent?.( name, data );
};
