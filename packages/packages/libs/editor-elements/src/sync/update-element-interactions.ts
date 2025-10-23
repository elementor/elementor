import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type V1ElementModelProps } from '..';
import { getContainer } from './get-container';

export const updateElementInteractions = ( {
    elementId,
    interactions,
}: {
    elementId: string;
    interactions: V1ElementModelProps[ 'interactions' ];
} ) => {
    const element = getContainer( elementId );

    if ( ! element ) {
        throw new Error( `Element with id ${ elementId } not found` );
    }

    // Set interactions directly as array, don't merge with existing
    element.model.set( 'interactions', interactions );

    // Dispatch the event that the hook is listening for
    window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );

    setDocumentModifiedStatus( true );
};

function setDocumentModifiedStatus( status: boolean ) {
    runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
}