import { InteractionItemValue } from "../types";
import type { ElementInteractions } from '../types';

import { createString, extractString } from "./prop-value-utils";
const TEMP_ID_PREFIX = 'temp-';
const TEMP_ID_REGEX = /^temp-[a-z0-9]+$/i;

export function generateTempInteractionId(): string {
	return `${TEMP_ID_PREFIX}${Math.random().toString(36).substring(2, 11)}`;
}

export function isTempId(id: string | undefined): boolean {
	return !!id && TEMP_ID_REGEX.test(id);
}

export function ensureInteractionId(
	interaction: InteractionItemValue
): InteractionItemValue {
	if (!interaction.interaction_id) {
		return {
			...interaction,
			interaction_id: createString(generateTempInteractionId()),
		};
	}
	return interaction;
}

// export function stripTempIds(
// 	interactions: ElementInteractions
// ): ElementInteractions {
// 	return {
// 		...interactions,
// 		items: interactions.items?.map( ( item ) => {
// 			if ( item.$$type === 'interaction-item' && item.value ) {
// 				const interactionId = extractString( item.value.interaction_id );
// 				if ( interactionId && isTempId( interactionId ) ) {
// 					const { interaction_id, ...rest } = item.value;
// 					return {
// 						...item,
// 						value: rest,
// 					};
// 				}
// 			}
// 			return item;
// 		} ) || [],
// 	};
// }