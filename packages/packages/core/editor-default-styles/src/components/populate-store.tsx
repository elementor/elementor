import { useEffect } from 'react';
import {
  __privateListenTo as listenTo,
  registerDataHook,
  routeCloseEvent,
} from '@elementor/editor-v1-adapters';
import { __getState as getState } from '@elementor/store';

import { loadDefaultStyles } from '../load-default-styles';
import { selectIsDirty } from '../store';

const V2_PANEL_ROUTE = 'panel/v2';

export function PopulateStore() {
  useEffect( () => {
    void loadDefaultStyles();

    registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
      if ( selectIsDirty( getState() ) ) {
        return;
      }

      await loadDefaultStyles();
    } );

    const unsubscribe = listenTo( routeCloseEvent( V2_PANEL_ROUTE ), () => {
      if ( selectIsDirty( getState() ) ) {
        return;
      }

      void loadDefaultStyles();
    } );

    return unsubscribe;
  }, [] );

  return null;
}
