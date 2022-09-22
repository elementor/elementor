import { useEffect, useState, useCallback } from 'react';

export const STATUS_APPLIED = 'applied';
export const STATUS_NOT_APPLIED = 'not_applied';

/**
 * Hook to use the current document history.
 *
 * @return {{applyItem: (function(*): void), items: *[], currentItem: number}}
 */
export const useDocumentHistory = () => {
    const [ items, setItems ] = useState( $e.store.getState( 'document/history' ).items ),
        currentItem = items.findIndex( ( item ) => STATUS_NOT_APPLIED === item.status );

    // Sync the local state with the global history state.
    useEffect( () => {
        // Return the unsubscribe function.
        return $e.store.subscribe( () => {
            setItems( $e.store.getState( 'document/history' ).items );
        } );
    }, [] );

    const applyItem = useCallback( ( e, args ) => {
        $e.run( 'panel/history/actions/do', { index: args.id } );
    }, [] );

    return {
        items,
        currentItem,
        applyItem,
    };
};
