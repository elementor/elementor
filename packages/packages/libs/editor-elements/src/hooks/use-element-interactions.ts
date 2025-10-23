import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { getElementInteractions } from '../sync/get-element-interactions';
import { type ElementID } from '../types';

export const useElementInteractions = ( elementId: ElementID ) => {
    return useListenTo(
        windowEvent( 'elementor/element/update_interactions' ),
        () => getElementInteractions( elementId ),
        [ elementId ]
    );
};