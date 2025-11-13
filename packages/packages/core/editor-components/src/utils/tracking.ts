import { type V1Element } from '@elementor/editor-elements';
import { getMixpanel } from '@elementor/mixpanel';
import { __getState as getState } from '@elementor/store';

import { selectCreatedThisSession } from '../store/store';
import { type ExtendedWindow } from '../types';

type ComponentEventData = Record< string, unknown > & {
	action: 'createClicked' | 'created' | 'createCancelled' | 'instanceAdded' | 'edited';
};

export const trackComponentEvent = ( { action, ...data }: ComponentEventData ) => {
	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.components?.[ action ] ) {
		return;
	}

	const name = config.names.components[ action ];
	dispatchEvent?.( name, data );
};

export const onElementDrop = ( _args: unknown, result: V1Element ) => {
	if ( result.model.get( 'widgetType' ) === 'e-component' ) {
		const editorSettings = result.model.get( 'editor_settings' );
		const componentName = editorSettings?.title;
		const componentUID = editorSettings?.component_uid;
		const instanceId = result.id;

		const createdThisSession = selectCreatedThisSession( getState() );
		const isSameSessionReuse = componentUID && createdThisSession.includes( componentUID );

		const eventsManagerConfig = ( window as unknown as ExtendedWindow ).elementorCommon.eventsManager.config;
		trackComponentEvent( {
			action: 'instanceAdded',
			instance_id: instanceId,
			component_uid: componentUID,
			component_name: componentName,
			is_same_session_reuse: isSameSessionReuse,
			location: eventsManagerConfig.locations.widgetPanel,
			secondary_location: eventsManagerConfig.secondaryLocations.componentsTab,
		} );
	}
};
