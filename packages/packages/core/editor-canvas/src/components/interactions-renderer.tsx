import * as React from 'react';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';
import { Portal } from '@elementor/ui';

import { useInteractionsItems } from '../hooks/use-interactions-items';
import { getCanvasIframeDocument } from '../sync/get-canvas-iframe-document';

export function InteractionsRenderer() {
	const container = usePortalContainer();
	const interactionItems = useInteractionsItems();

	if ( ! container ) {
		return null;
	}

	// const interactionsData = JSON.stringify( Array.isArray( interactionItems ) ? interactionItems : [] );
	console.log( 'interactionItems', interactionItems );
	const simplifiedData = interactionItems.map( ( item ) => {
		const interactionIds = transformInteractionsToIds( item.interactions );
		return {
			elementId: item.elementId,
			dataId: item.dataId,
			interactions: interactionIds,
		};
	} );

	const interactionsData = JSON.stringify( simplifiedData );
	console.log( 'interactionsData', interactionsData );
	// console.log( 'simplifiedData', simplifiedData );

	return (
		<Portal container={ container }>
			<script
				type="application/json"
				data-e-interactions="true"
				dangerouslySetInnerHTML={ {
					__html: interactionsData,
				} }
			/>
		</Portal>
	);
}

function transformInteractionsToIds( interactions: any ): string[] {
	if ( ! interactions || ! interactions.items || ! Array.isArray( interactions.items ) ) {
		return [];
	}

	return interactions.items
		.map( ( item: any ) => {
			const interactionId = getPropValue( item, 'interaction_id' );
			const trigger = getPropValue( item, 'trigger' );
			const animation = getPropValue( item, 'animation' );

			if ( ! trigger || ! animation ) {
				return null;
			}

			const effect = getPropValue( animation, 'effect' );
			const type = getPropValue( animation, 'type' );
			const direction = getPropValue( animation, 'direction' );
			const timingConfig = getPropValue( animation, 'timing_config' );

			if ( ! effect || ! type ) {
				return null;
			}

			const duration = timingConfig ? getPropValue( timingConfig, 'duration', 300 ) : 300;
			const delay = timingConfig ? getPropValue( timingConfig, 'delay', 0 ) : 0;

			// Build the ID string: id-trigger-effect-type-direction-duration-delay
			const parts = [
				interactionId || '',
				trigger,
				effect,
				type,
				direction || '',
				duration,
				delay,
			].filter( ( part ) => part !== '' && part !== null && part !== undefined );

			return parts.join( '-' );
		} )
		.filter( ( id ): id is string => id !== null );
}

function getPropValue( data: any, key: string, defaultValue: any = '' ): any {
	if ( ! data || typeof data !== 'object' || ! ( key in data ) ) {
		return defaultValue;
	}

	const value = data[ key ];

	// Handle prop type structure: { $$type: 'string', value: 'actual-value' }
	if ( value && typeof value === 'object' && '$$type' in value && 'value' in value ) {
		return value.value;
	}

	// Handle plain values
	return value !== undefined ? value : defaultValue;
}

function usePortalContainer() {
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => getCanvasIframeDocument()?.head );
}
