import { type ElementID } from '../types';
import { getContainer } from './get-container';

export function getElementInteractions( elementId: ElementID ) {
    const container = getContainer( elementId );
    
    const interactions = container?.model?.get( 'interactions' );
    
    console.log('Raw interactions from model:', interactions);
    
    // If it's a string, return it as-is (for React component)
    if (typeof interactions === 'string') {
        return interactions;
    }
    
    // If it's an array, stringify it (for React component)
    if (Array.isArray(interactions)) {
        return JSON.stringify(interactions);
    }
    
    return '';
}