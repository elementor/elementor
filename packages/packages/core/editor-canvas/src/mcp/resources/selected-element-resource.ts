import { getContainer, getSelectedElements, getWidgetsCache, type V1Element } from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import {
	__privateListenTo as listenTo,
	commandEndEvent,
	type CommandEvent,
	type ListenerEvent,
} from '@elementor/editor-v1-adapters';

export const SELECTED_ELEMENT_URI = 'elementor://context/selected-element';

type WidgetVersion = 'v3' | 'v4';

type SelectionContainer = V1Element & {
	type?: string;
	label?: string;
	model: V1Element[ 'model' ] & {
		config?: { atomic?: boolean };
	};
	settings: V1Element[ 'settings' ] & {
		toJSON?: () => Record< string, unknown >;
	};
};

type SelectedElementPayload = {
	elementDisplayName: string | null;
	elementType: string | null;
	properties: Record< string, unknown > | null;
	selectedElementId: string | null;
	selectedParentId: string | null;
	version: WidgetVersion | null;
	widgetType: string | null;
};

export const initSelectedElementResource = ( reg: MCPRegistryEntry ) => {
	const { resource, sendResourceUpdated } = reg;

	let currentPayloadText: string | null = null;

	const publishIfChanged = ( payload: SelectedElementPayload ) => {
		const nextText = JSON.stringify( payload );

		if ( nextText !== currentPayloadText ) {
			currentPayloadText = nextText;
			sendResourceUpdated( { uri: SELECTED_ELEMENT_URI } );
		}
	};

	const onCommand = ( e: ListenerEvent ) => {
		if ( e.type !== 'command' ) {
			return;
		}

		const commandEvent = e as CommandEvent< { container?: SelectionContainer } >;

		if ( commandEvent.command === 'document/elements/deselect-all' ) {
			publishIfChanged( createEmptySelectedElementPayload() );
			return;
		}

		if (
			commandEvent.command !== 'document/elements/select' &&
			commandEvent.command !== 'document/elements/settings'
		) {
			return;
		}

		const { container } = commandEvent.args || {};

		if ( container?.id ) {
			publishIfChanged( buildPayloadFromContainer( container ) );
			return;
		}

		publishIfChanged( readSelectionFromEditor() );
	};

	listenTo(
		[
			commandEndEvent( 'document/elements/select' ),
			commandEndEvent( 'document/elements/deselect-all' ),
			commandEndEvent( 'document/elements/settings' ),
		],
		onCommand
	);

	publishIfChanged( readSelectionFromEditor() );

	resource(
		'selected-element',
		SELECTED_ELEMENT_URI,
		{
			description: 'Currently selected Elementor element context.',
		},
		async () => {
			return {
				contents: [
					{
						uri: SELECTED_ELEMENT_URI,
						text: JSON.stringify( readSelectionFromEditor(), null, 2 ),
					},
				],
			};
		}
	);
};

function createEmptySelectedElementPayload(): SelectedElementPayload {
	return {
		elementDisplayName: null,
		elementType: null,
		properties: null,
		selectedElementId: null,
		selectedParentId: null,
		version: null,
		widgetType: null,
	};
}

function readSelectionFromEditor(): SelectedElementPayload {
	const elements = getSelectedElements();

	if ( elements.length !== 1 ) {
		return createEmptySelectedElementPayload();
	}

	const container = getContainer( elements[ 0 ].id );

	return buildPayloadFromContainer( container );
}

function buildPayloadFromContainer( container: SelectionContainer | null ): SelectedElementPayload {
	if ( ! container?.id ) {
		return createEmptySelectedElementPayload();
	}

	const widgetType = container.model.get( 'widgetType' ) ?? null;
	const elementType = container.type ?? 'widget';

	return {
		elementDisplayName: getElementDisplayName( container ),
		elementType,
		properties: getElementProperties( container, widgetType ),
		selectedElementId: container.id,
		selectedParentId: container.parent?.id ?? null,
		version: resolveElementVersion( container, widgetType ),
		widgetType,
	};
}

function resolveElementVersion( container: SelectionContainer, widgetType: string | null ): WidgetVersion {
	if ( container.model?.config?.atomic ) {
		return 'v4';
	}
	if ( widgetType && getWidgetsCache()?.[ widgetType ]?.atomic_props_schema ) {
		return 'v4';
	}
	return 'v3';
}

function getElementProperties(
	container: SelectionContainer,
	widgetType: string | null
): Record< string, unknown > | null {
	const settings = container.settings?.toJSON?.();
	if ( ! settings || typeof settings !== 'object' ) {
		return null;
	}

	const widgetConfig = widgetType ? getWidgetsCache()?.[ widgetType ] : null;
	const controls = widgetConfig?.controls as Record< string, { default?: unknown } > | undefined;

	const filtered: Record< string, unknown > = {};

	for ( const [ key, value ] of Object.entries( settings ) ) {
		if ( value === undefined || value === null || value === '' ) {
			continue;
		}

		const controlDefault = controls?.[ key ]?.default;
		if ( controlDefault !== undefined && JSON.stringify( value ) === JSON.stringify( controlDefault ) ) {
			continue;
		}

		filtered[ key ] = value;
	}

	return Object.keys( filtered ).length > 0 ? filtered : null;
}

function getElementDisplayName( container: SelectionContainer ): string {
	try {
		if ( container.label ) {
			return container.label;
		}

		const widgetType = container.model?.get?.( 'widgetType' );

		if ( widgetType ) {
			const capitalizedType = widgetType.charAt( 0 ).toUpperCase() + widgetType.slice( 1 );

			return capitalizedType.replace( /-/g, ' ' );
		}

		if ( container.type === 'container' ) {
			return 'Container';
		}

		if ( container.type === 'section' ) {
			return 'Section';
		}

		return `Element ${ container.id }`;
	} catch {
		return `Element ${ container.id }`;
	}
}
