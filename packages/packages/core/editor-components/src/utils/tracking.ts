import { type V1Element } from '@elementor/editor-elements';
import { getMixpanel } from '@elementor/events';
import { __getState as getState } from '@elementor/store';

import { selectCreatedThisSession } from '../store/store';
import { type ExtendedWindow } from '../types';

export type ExecutedBy = 'user' | 'mcp_tool' | 'system';
// TODO: Remove this type in version 4.4.0
/** @deprecated since 4.2.1 - use `ExecutedBy` instead */
export type Source = ExecutedBy;

type ComponentEventData = Record< string, unknown > & {
	action:
		| 'createClicked'
		| 'created'
		| 'createCancelled'
		| 'instanceAdded'
		| 'edited'
		| 'propertyExposed'
		| 'propertyRemoved'
		| 'propertiesPanelOpened'
		| 'propertiesGroupCreated'
		| 'detached';
	executedBy?: ExecutedBy;
	// TODO: Remove `source` parameter in version 4.4.0 - it's replaced by `executedBy`, but pro's older versions will still send `source`
	// so we keep both for backward compatibility
	/** @deprecated since 4.2.1 - use `executedBy` instead */
	source?: Source;
};

const FEATURE_NAME = 'Components';

export const trackComponentEvent = ( { action, source, executedBy, ...data }: ComponentEventData ) => {
	if ( source === 'system' || executedBy === 'system' ) {
		return;
	}

	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.components?.[ action ] ) {
		return;
	}

	const name = config.names.components[ action ];
	dispatchEvent?.( name, { ...data, executed_by: executedBy ?? source, 'Feature name': FEATURE_NAME } );
};

// TODO: Remove this function in version 4.4.0 - moved to pro
export const onElementDrop = ( _args: unknown, element: V1Element ) => {
	if ( ! ( element?.model?.get( 'widgetType' ) === 'e-component' ) ) {
		return;
	}

	const editorSettings = element.model.get( 'editor_settings' );
	const componentName = editorSettings?.title;
	const componentUID = editorSettings?.component_uid;
	const instanceId = element.id;

	const createdThisSession = selectCreatedThisSession( getState() );
	const isSameSessionReuse = componentUID && createdThisSession.includes( componentUID );

	const eventsManagerConfig = ( window as unknown as ExtendedWindow ).elementorCommon.eventsManager.config;
	const { locations, secondaryLocations } = eventsManagerConfig;

	trackComponentEvent( {
		action: 'instanceAdded',
		executedBy: 'user',
		instance_id: instanceId,
		component_uid: componentUID,
		component_name: componentName,
		is_same_session_reuse: isSameSessionReuse,
		location: locations.widgetPanel,
		secondary_location: secondaryLocations.componentsTab,
	} );
};
