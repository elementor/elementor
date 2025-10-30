import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';
import { useState, useEffect } from 'react';

import { getElementInteractions } from '../sync/get-element-interactions';
import { type ElementID } from '../types';

// export const useElementInteractions = ( elementId: ElementID ) => {
//     const [interactions, setInteractions] = useState(() => getElementInteractions(elementId));
    
//     useListenTo(
//         windowEvent( 'elementor/element/update_interactions' ),
//         () => setInteractions(getElementInteractions(elementId)),
//         [elementId]
//     );
    
//     return interactions;
// };
export const useElementInteractions = ( elementId: ElementID ) => {
    const [interactions, setInteractions] = useState(() => {
        const initial = getElementInteractions(elementId);
        console.log('Initial interactions:', initial);
        return initial;
    });
    
    useListenTo(
        windowEvent( 'elementor/element/update_interactions' ),
        () => {
            const newInteractions = getElementInteractions(elementId);
            console.log('Updated interactions:', newInteractions);
            setInteractions(newInteractions);
        },
        [elementId]
    );
    
    return interactions;
};