import * as React from 'react';
import { useMemo } from 'react';
import { PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import {
    type ElementID,
    getElementLabel,
    updateElementInteractions,
    useElementInteractions,
} from '@elementor/editor-elements';
import { type PropKey } from '@elementor/editor-props';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { createTopLevelObjectType } from './create-top-level-object-type';

type InteractionsFieldProps = {
    bind: PropKey;
    propDisplayName: string;
    children?: React.ReactNode;
};

const HISTORY_DEBOUNCE_WAIT = 800;

export const InteractionsField = ( { bind, children, propDisplayName }: InteractionsFieldProps ) => {
    const {
        element: { id: elementId },
        elementType: { propsSchema },
    } = useElement();

    const elementInteractions = useElementInteractions( elementId );
    
    // The value structure needs to match what TextControl expects
    const value = { [ bind ]: elementInteractions || '' };

    const undoableUpdateElementInteractions = useMemo( () => {
        return undoable(
            {
                do: ( newValue: Record<string, unknown> ) => {
                    const prevInteractions = elementInteractions;
                    
                    // Extract the actual value from the newValue object
                    updateElementInteractions( { 
                        elementId, 
                        interactions: newValue[ bind ] as string
                    } );
                    setDocumentModifiedStatus( true );

                    return prevInteractions;
                },

                undo: ( {}, prevInteractions ) => {
                    updateElementInteractions( { 
                        elementId, 
                        interactions: prevInteractions as string
                    } );
                },
            },
            {
                title: getElementLabel( elementId ),
                subtitle: __( '%s edited', 'elementor' ).replace( '%s', propDisplayName ),
                debounce: { wait: HISTORY_DEBOUNCE_WAIT },
            }
        );
    }, [ elementId, propDisplayName ] );

    const setValue = ( newValue: Record<string, unknown> ) => {
        undoableUpdateElementInteractions( newValue );
    };

    // Use the same approach as SettingsField and StylesField
    const propType = createTopLevelObjectType( { schema: propsSchema } );

    return (
        <PropProvider propType={ propType } value={ value } setValue={ setValue }>
            <PropKeyProvider bind={ bind }>{ children }</PropKeyProvider>
        </PropProvider>
    );
};