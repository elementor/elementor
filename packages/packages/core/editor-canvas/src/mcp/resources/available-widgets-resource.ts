import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { type AvailableWidget, getAvailableWidgets } from '../utils/element-data-util';

export const AVAILABLE_WIDGETS_URI = 'elementor://context/available-widgets';
export const AVAILABLE_WIDGETS_URI_V4 = 'elementor://context/available-widgets/v4';

export const initAvailableWidgetsResource = ( reg: MCPRegistryEntry ) => {
	const { resource, sendResourceUpdated } = reg;

	const buildContents = ( uri: string, filterFunction: ( x: AvailableWidget ) => boolean = () => true ) => {
		const widgets = getAvailableWidgets().filter( filterFunction );
		return {
			contents: [
				{
					uri,
					mimeType: 'application/json',
					text: JSON.stringify( widgets, null, 2 ),
				},
			],
		};
	};

	const notifyResourcesUpdated = () => {
		sendResourceUpdated( {
			uri: AVAILABLE_WIDGETS_URI,
			...buildContents( AVAILABLE_WIDGETS_URI ),
		} );
		sendResourceUpdated( {
			uri: AVAILABLE_WIDGETS_URI_V4,
			...buildContents( AVAILABLE_WIDGETS_URI_V4, ( w: AvailableWidget ) => w.version === 'v4' ),
		} );
	};

	resource(
		'available-widgets-v4',
		AVAILABLE_WIDGETS_URI_V4,
		{
			description: 'All registered v4 version widgets',
		},
		async () => buildContents( AVAILABLE_WIDGETS_URI_V4, ( w ) => w.version === 'v4' )
	);

	resource(
		'available-widgets',
		AVAILABLE_WIDGETS_URI,
		{
			description: 'All registered widget types with v3/v4 version metadata and description.',
		},
		async () => buildContents( AVAILABLE_WIDGETS_URI )
	);

	const eventName = v1ReadyEvent().name;

	const onV1Ready = () => {
		const widgets = getAvailableWidgets();
		if ( widgets.length === 0 ) {
			return;
		}
		window.removeEventListener( eventName, onV1Ready );
		notifyResourcesUpdated();
	};

	window.addEventListener( eventName, onV1Ready );
	onV1Ready();
};
