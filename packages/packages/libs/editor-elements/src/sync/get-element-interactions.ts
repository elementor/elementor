import { type ElementID } from '../types';
import { getContainer } from './get-container';

export function getElementInteractions( elementId: ElementID ) {
    const container = getContainer( elementId );
    
    const interactions = container?.model.get( 'interactions' );
    
    // Return string or empty string
    return typeof interactions === 'string' ? interactions : '';
}