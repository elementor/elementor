import { type SizeStringValue } from './types';

export type ActiveScrollInteraction = {
	start: SizeStringValue;
	end: SizeStringValue;
	relativeTo: string;
};

export const SCROLL_INTERACTION_EVENT = 'elementor/interactions/scroll-change';

export function dispatchScrollInteraction( data: ActiveScrollInteraction | null ) {
	window.dispatchEvent( new CustomEvent( SCROLL_INTERACTION_EVENT, { detail: data } ) );
}
