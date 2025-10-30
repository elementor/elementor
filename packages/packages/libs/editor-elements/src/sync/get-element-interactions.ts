import { type ElementID } from '../types';
import { getContainer } from './get-container';

export const getElementInteractions = ( elementId: ElementID ): string => {
	const container = getContainer( elementId );
	const raw = container?.model?.get( 'interactions' );
	return typeof raw === 'string' ? raw : JSON.stringify( raw ?? [] );
};
