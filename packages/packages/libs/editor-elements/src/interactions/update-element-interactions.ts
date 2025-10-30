import { type ElementID } from '../types';
import { mutateElementInteractions } from './mutate-element-interactions';

export type UpdateElementInteractionsArgs = {
	elementId: ElementID;
	interactions: string; // JSON string representing interactions array
};

export function updateElementInteractions( args: UpdateElementInteractionsArgs ) {
	mutateElementInteractions( args.elementId, () => args.interactions );
}
