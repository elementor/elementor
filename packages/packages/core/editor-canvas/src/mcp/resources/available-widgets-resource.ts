import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { type AvailableWidget, getAvailableWidgets } from '../utils/element-data-util';

export const AVAILABLE_WIDGETS_URI = 'elementor://context/available-widgets';
export const AVAILABLE_WIDGETS_URI_V4 = 'elementor://context/available-widgets/v4';

export const initAvailableWidgetsResource = ( reg: MCPRegistryEntry ) => {
	const { resource, sendResourceUpdated } = reg;

	let currentPayload: string | null = null;
	let currentPayloadV4Only: string | null = null;

	const buildContents = ( filterFunction: ( x: AvailableWidget ) => boolean = () => true ) => {
		const widgets = getAvailableWidgets().filter( filterFunction );
		return {
			contents: [
				{
					uri: AVAILABLE_WIDGETS_URI,
					mimeType: 'application/json',
					text: JSON.stringify( widgets, null, 2 ),
				},
			],
		};
	};

	const notifyIfChanged = () => {
		const allWidgets = getAvailableWidgets();
		const allWidgetsV4 = allWidgets.filter( ( w ) => w.version === 'v4' );
		const next = JSON.stringify( allWidgets );
		if ( next !== currentPayload ) {
			currentPayload = next;
			sendResourceUpdated( {
				uri: AVAILABLE_WIDGETS_URI,
				...buildContents(),
			} );
			const nextv4 = JSON.stringify( allWidgetsV4 );
			if ( nextv4 !== currentPayloadV4Only ) {
				currentPayloadV4Only = nextv4;
				sendResourceUpdated( {
					uri: AVAILABLE_WIDGETS_URI_V4,
					...buildContents( ( w: AvailableWidget ) => w.version === 'v4' ),
				} );
			}
		}
	};

	resource(
		'available-widgets-v4',
		AVAILABLE_WIDGETS_URI_V4,
		{
			description: 'All registered v4 version widgets',
		},
		async () => buildContents( ( w ) => w.version === 'v4' )
	);

	resource(
		'available-widgets',
		AVAILABLE_WIDGETS_URI,
		{
			description: 'All registered widget types with v3/v4 version metadata and description.',
		},
		async () => buildContents()
	);

	window.addEventListener( v1ReadyEvent().name, () => {
		notifyIfChanged();
	} );

	notifyIfChanged();
};
