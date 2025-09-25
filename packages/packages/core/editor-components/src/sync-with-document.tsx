import { useEffect } from 'react';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { syncWithDocumentSave } from './sync-with-document-save';

export function SyncWithDocumentSave() {
    useEffect(() => {
        listenTo(v1ReadyEvent(), () => {
            // syncWithDocumentSave();
        });

        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
