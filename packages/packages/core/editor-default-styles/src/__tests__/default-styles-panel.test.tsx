import * as React from 'react';
import { createMockStyleDefinitionWithVariants, renderWithStore } from 'test-utils';
import {
  __createStore as createStore,
  __dispatch as dispatch,
  __getState as getState,
  __registerSlice as registerSlice,
  type Store,
} from '@elementor/store';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { DefaultStylesPanelEmbedded } from '../default-styles-panel';
import { saveDefaultStyles } from '../save-default-styles';
import { selectIsDirty, slice } from '../store';

jest.mock( '../save-default-styles', () => ( {
  saveDefaultStyles: jest.fn(),
} ) );

jest.mock( '../components/default-styles-panel-content', () => ( {
  DefaultStylesPanelContent: ( { onRequestClose }: { onRequestClose: () => void } ) => (
    <button type="button" onClick={ onRequestClose }>
      Close
    </button>
  ),
} ) );

describe( 'DefaultStylesPanelEmbedded', () => {
  let store: Store;

  beforeEach( () => {
    registerSlice( slice );
    store = createStore();
    jest.mocked( saveDefaultStyles ).mockResolvedValue( undefined );
  } );

  it( 'should close immediately when there are no unsaved changes', () => {
    // Arrange
    const onRequestClose = jest.fn();

    // Act
    renderPanel( store, onRequestClose );
    fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

    // Assert
    expect( screen.queryByText( 'You have unsaved changes' ) ).not.toBeInTheDocument();
    expect( onRequestClose ).toHaveBeenCalled();
    expect( saveDefaultStyles ).not.toHaveBeenCalled();
  } );

  it( 'should show a dialog when closing with unsaved changes', () => {
    // Arrange
    const onRequestClose = jest.fn();

    renderPanel( store, onRequestClose );
    makeStoreDirty();

    // Act
    fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

    // Assert
    expect( screen.getByText( 'You have unsaved changes' ) ).toBeInTheDocument();
    expect( onRequestClose ).not.toHaveBeenCalled();
    expect( saveDefaultStyles ).not.toHaveBeenCalled();
  } );

  it( 'should persist styles and close when confirming the dialog', async () => {
    // Arrange
    const onRequestClose = jest.fn();

    renderPanel( store, onRequestClose );
    makeStoreDirty();

    // Act
    fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );
    fireEvent.click( screen.getByRole( 'button', { name: 'Save & Continue' } ) );

    // Assert
    await waitFor( () => {
      expect( saveDefaultStyles ).toHaveBeenCalled();
    } );

    await waitFor( () => {
      expect( onRequestClose ).toHaveBeenCalled();
    } );
  } );

  it( 'should keep the panel open when persist fails', async () => {
    // Arrange
    const onRequestClose = jest.fn();

    jest.mocked( saveDefaultStyles ).mockRejectedValue( new Error( 'save failed' ) );

    renderPanel( store, onRequestClose );
    makeStoreDirty();

    // Act
    fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );
    fireEvent.click( screen.getByRole( 'button', { name: 'Save & Continue' } ) );

    // Assert
    await waitFor( () => {
      expect( saveDefaultStyles ).toHaveBeenCalled();
    } );

    expect( onRequestClose ).not.toHaveBeenCalled();
    expect( screen.getByText( 'You have unsaved changes' ) ).toBeInTheDocument();
  } );

  it( 'should discard in-memory edits and close without persisting', () => {
    // Arrange
    const onRequestClose = jest.fn();

    renderPanel( store, onRequestClose );
    makeStoreDirty();

    // Act
    fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );
    fireEvent.click( screen.getByRole( 'button', { name: 'Discard' } ) );

    // Assert
    expect( saveDefaultStyles ).not.toHaveBeenCalled();
    expect( selectIsDirty( getState() ) ).toBe( false );
    expect( onRequestClose ).toHaveBeenCalled();
  } );
} );

function renderPanel( store: Store, onRequestClose: () => void ) {
  return renderWithStore( <DefaultStylesPanelEmbedded onRequestClose={ onRequestClose } />, store );
}

function makeStoreDirty() {
  dispatch(
    slice.actions.load( {
      data: {},
    } )
  );

  dispatch(
    slice.actions.update( {
      style: createMockStyleDefinitionWithVariants( {
        id: 'h2',
        variants: [
          {
            meta: { breakpoint: 'desktop', state: null },
            props: { 'font-size': '12px' },
            custom_css: null,
          },
        ],
      } ),
    } )
  );
}
