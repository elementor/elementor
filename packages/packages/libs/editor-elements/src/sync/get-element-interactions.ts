import { type ElementID } from '../types';
import { getContainer } from './get-container';

export function getElementInteractions( elementId: ElementID ) {
    const container = getContainer( elementId );
    
    const interactions = container?.model?.get( 'interactions' );
    
    console.log('Raw interactions from model:', interactions);
    
    if (typeof interactions === 'string') {
        return interactions;
    }
    
    if (Array.isArray(interactions)) {
        return JSON.stringify(interactions);
    }
    
    return '';
}