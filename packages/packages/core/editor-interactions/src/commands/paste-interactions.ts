import {
	getContainer,
	getElementInteractions,
	getElementLabel,
	getWidgetsCache,
	updateElementInteractions,
	type V1Element,
	type V1ElementModelProps,
} from '@elementor/editor-elements';
import {
	__privateListenTo as listenTo,
	type CommandEvent,
	commandStartEvent,
	undoable,
} from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import type { ElementInteractions } from '../types';
import { createString } from '../utils/prop-value-utils';
import { generateTempInteractionId } from '../utils/temp-id-utils';
import { getClipboardElements } from './get-clipboard-elements';

function isAtomicContainer( container: V1Element ): boolean {
	const type = container?.model.get( 'widgetType' ) || container?.model.get( 'elType' );
	const widgetsCache = getWidgetsCache();
	const elementConfig = widgetsCache?.[ type ];

	return Boolean( elementConfig?.atomic_props_schema );
}

type PasteInteractionsCommandArgs = {
	container?: V1Element;
	containers?: V1Element[];
	storageKey?: string;
};

type PasteInteractionsPayload = {
	containers: V1Element[];
	newInteractions: ElementInteractions;
};

function getTitleForContainers( containers: V1Element[] ): string {
	return containers.length > 1 ? __( 'Elements', 'elementor' ) : getElementLabel( containers[ 0 ].id );
}

function normalizeClipboardInteractions( raw: V1ElementModelProps[ 'interactions' ] ): ElementInteractions | null {
	if ( ! raw ) {
		return null;
	}

	const parsed: ElementInteractions = typeof raw === 'string' ? ( JSON.parse( raw ) as ElementInteractions ) : raw;

	if ( ! parsed?.items?.length ) {
		return null;
	}

	return { version: parsed.version ?? 1, items: parsed.items };
}

function regenerateInteractionIds( interactions: ElementInteractions ): ElementInteractions {
	const cloned = structuredClone( interactions ) as ElementInteractions;

	cloned.items?.forEach( ( item ) => {
		if ( item.$$type === 'interaction-item' && item.value ) {
			item.value.interaction_id = createString( generateTempInteractionId() );
		}
	} );

	return cloned;
}

export function initPasteInteractionsCommand() {
	const undoablePasteInteractions = undoable(
		{
			do: ( { containers, newInteractions }: PasteInteractionsPayload ) => {
				const pasted = regenerateInteractionIds( newInteractions );

				return containers.map( ( container ) => {
					const elementId = container.id;
					const previous = getElementInteractions( elementId );

					updateElementInteractions( {
						elementId,
						interactions: pasted,
					} );

					return { elementId, previous: previous ?? { version: 1, items: [] } };
				} );
			},
			undo: ( _: PasteInteractionsPayload, revertData ) => {
				revertData.forEach( ( { elementId, previous } ) => {
					updateElementInteractions( {
						elementId,
						interactions: previous.items?.length ? previous : undefined,
					} );
				} );
			},
		},
		{
			title: ( { containers } ) => getTitleForContainers( containers ),
			subtitle: __( 'Interactions Pasted', 'elementor' ),
		}
	);

	listenTo( commandStartEvent( 'document/elements/paste-interactions' ), ( e ) => {
		const args = ( e as CommandEvent ).args as PasteInteractionsCommandArgs;
		const containers = args.containers ?? ( args.container ? [ args.container ] : [] );
		const storageKey = args.storageKey ?? 'clipboard';

		if ( ! containers.length ) {
			return;
		}

		const clipboardElements = getClipboardElements( storageKey );
		const [ clipboardElement ] = clipboardElements ?? [];

		if ( ! clipboardElement ) {
			return;
		}

		const newInteractions = normalizeClipboardInteractions( clipboardElement.interactions );

		if ( ! newInteractions ) {
			return;
		}

		const existingContainers = containers.filter( ( c ) => getContainer( c.id ) ) as V1Element[];
		const validContainers = existingContainers.filter( isAtomicContainer );

		if ( ! validContainers.length ) {
			return;
		}

		undoablePasteInteractions( { containers: validContainers, newInteractions } );
	} );
}
