import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { __createPanel as createPanel } from '@elementor/editor-panels';
import { SaveChangesDialog, useDialog } from '@elementor/editor-ui';
import {
  __privateListenTo as listenTo,
  __privateOpenRoute as openRoute,
  routeCloseEvent,
} from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { DialogHeader } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { DefaultStylesPanelContent } from './components/default-styles-panel-content';
import { saveDefaultStyles } from './save-default-styles';
import { selectIsDirty, slice } from './store';

const PANEL_ID = 'default-styles';
const V2_PANEL_ROUTE = 'panel/v2';

export const { panel, usePanelStatus, usePanelActions } = createPanel( {
  id: PANEL_ID,
  component: DefaultStylesPanelRoot,
} );

function DefaultStylesPanelRoot() {
  const { close } = usePanelActions();
  const {
    open: openSaveChangesDialog,
    close: closeSaveChangesDialog,
    isOpen: isSaveChangesDialogOpen,
  } = useDialog();

  const resetAndClosePanel = useCallback( () => {
    dispatch( slice.actions.reset() );
    closeSaveChangesDialog();
    void close();
  }, [ close, closeSaveChangesDialog ] );

  const handleClosePanel = useCallback( () => {
    if ( selectIsDirty( getState() ) ) {
      openSaveChangesDialog();
      return;
    }

    void close();
  }, [ close, openSaveChangesDialog ] );

  useEffect( () => {
    const unsubscribe = listenTo( routeCloseEvent( V2_PANEL_ROUTE ), () => {
      if ( ! selectIsDirty( getState() ) ) {
        return;
      }

      openRoute( V2_PANEL_ROUTE );
      openSaveChangesDialog();
    } );

    return unsubscribe;
  }, [ openSaveChangesDialog ] );

  return (
    <>
      <DefaultStylesPanelContent onRequestClose={ handleClosePanel } />
      { isSaveChangesDialogOpen && (
        <SaveChangesDialog>
          <DialogHeader onClose={ closeSaveChangesDialog } logo={ false }>
            <SaveChangesDialog.Title>
              { __( 'You have unsaved changes', 'elementor' ) }
            </SaveChangesDialog.Title>
          </DialogHeader>
          <SaveChangesDialog.Content>
            <SaveChangesDialog.ContentText>
              { __( 'You have unsaved changes in Default Styles.', 'elementor' ) }
            </SaveChangesDialog.ContentText>
            <SaveChangesDialog.ContentText>
              { __(
                'To avoid losing your updates, save your changes before leaving.',
                'elementor'
              ) }
            </SaveChangesDialog.ContentText>
          </SaveChangesDialog.Content>
          <SaveChangesDialog.Actions
            actions={ {
              discard: {
                label: __( 'Discard', 'elementor' ),
                action: resetAndClosePanel,
              },
              confirm: {
                label: __( 'Save & Continue', 'elementor' ),
                action: async () => {
                  await saveDefaultStyles();
                  closeSaveChangesDialog();
                  void close();
                },
              },
            } }
          />
        </SaveChangesDialog>
      ) }
    </>
  );
}
