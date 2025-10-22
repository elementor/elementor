import { type V1Element } from '@elementor/editor-elements';
import { type TransformablePropValue } from '@elementor/editor-props';
import { getMixpanel } from '@elementor/mixpanel';

import { type ExtendedWindow } from '../types';

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

export const onElementCreation = ( _args: unknown, result: V1Element ) => {
	if ( result.model.get( 'widgetType' ) === 'e-component' ) {
		const componentName = result.model.get( 'editor_settings' )?.title;
		const componentId = ( result.settings?.get( 'component' ) as TransformablePropValue< 'component-id', number > )
			?.value;
		const instanceId = result.id;

		const eventsManagerConfig = ( window as unknown as ExtendedWindow ).elementorCommon.eventsManager.config;
		trackComponentEvent( {
			action: 'instanceAdded',
			instance_id: instanceId,
			component_id: componentId,
			component_name: componentName,
			location: eventsManagerConfig.locations.widgetPanel,
			secondaryLocation: eventsManagerConfig.secondaryLocations.componentsTab,
		} );
	}
};
