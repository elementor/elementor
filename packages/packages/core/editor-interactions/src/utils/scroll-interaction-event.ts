import { type InteractionItemValue, type SizeStringValue } from '../types';
import { extractSize, extractString } from './prop-value-utils';

export type ActiveScrollInteraction = {
	start: SizeStringValue;
	end: SizeStringValue;
	relativeTo: string;
};

export const SCROLL_INTERACTION_EVENT = 'elementor/interactions/scroll-change';

export function dispatchScrollInteraction( data: ActiveScrollInteraction | null ) {
	window.dispatchEvent( new CustomEvent( SCROLL_INTERACTION_EVENT, { detail: data } ) );
}

export function extractScrollOverlayParams(
	interaction: InteractionItemValue,
	defaults: { trigger: string; start: number; end: number; relativeTo: string }
) {
	return {
		trigger: extractString( interaction.trigger, defaults.trigger ),
		start: extractSize( interaction.animation.value.config?.value.start, defaults.start ),
		end: extractSize( interaction.animation.value.config?.value.end, defaults.end ),
		relativeTo: extractString( interaction.animation.value.config?.value.relativeTo, defaults.relativeTo ),
	};
}

export function syncGridOverlay( trigger: string, start: SizeStringValue, end: SizeStringValue, relativeTo: string ) {
	if ( trigger === 'scrollOn' ) {
		dispatchScrollInteraction( { start, end, relativeTo } );
	} else {
		dispatchScrollInteraction( null );
	}
}
