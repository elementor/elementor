import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  DefaultStylesOpenGate,
  EVENT_REQUEST_OPEN_DEFAULT_STYLES,
} from '../default-styles-open-gate';

const mockSaveDocument = jest.fn().mockResolvedValue( undefined );
const mockUseActiveDocument = jest.fn().mockReturnValue( null );

jest.mock( '@elementor/editor-documents', () => ( {
  __useActiveDocument: ( ...args: unknown[] ) => mockUseActiveDocument( ...args ),
  __useActiveDocumentActions: () => ( { save: mockSaveDocument } ),
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
  ...jest.requireActual( '@elementor/editor-ui' ),
  ThemeProvider: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
  useDialog: jest.fn(),
} ) );

import { useDialog } from '@elementor/editor-ui';

jest.mock( '../default-styles-panel', () => ( {
  usePanelActions: jest.fn(),
} ) );

import { usePanelActions } from '../default-styles-panel';

jest.mock( '@wordpress/i18n', () => ( {
  __: ( str: string ) => str,
} ) );

function dispatchRequestOpen() {
  window.dispatchEvent( new CustomEvent( EVENT_REQUEST_OPEN_DEFAULT_STYLES ) );
}

describe( 'DefaultStylesOpenGate', () => {
  const mockOpen = jest.fn();
  const mockOpenSaveDialog = jest.fn();
  const mockCloseSaveDialog = jest.fn();

  beforeEach( () => {
    jest.clearAllMocks();

    jest.mocked( usePanelActions ).mockReturnValue( {
      open: mockOpen,
      close: jest.fn(),
    } );

    mockUseActiveDocument.mockReturnValue( null );

    jest.mocked( useDialog ).mockReturnValue( {
      open: mockOpenSaveDialog,
      close: mockCloseSaveDialog,
      isOpen: false,
    } );
  } );

  it( 'should open the panel immediately when the document is clean', () => {
    mockUseActiveDocument.mockReturnValue( { isDirty: false } );

    render( <DefaultStylesOpenGate /> );

    act( () => {
      dispatchRequestOpen();
    } );

    expect( mockOpen ).toHaveBeenCalled();
    expect( mockOpenSaveDialog ).not.toHaveBeenCalled();
  } );

  it( 'should open the save dialog when the document is dirty', () => {
    mockUseActiveDocument.mockReturnValue( { isDirty: true } );

    render( <DefaultStylesOpenGate /> );

    act( () => {
      dispatchRequestOpen();
    } );

    expect( mockOpenSaveDialog ).toHaveBeenCalled();
    expect( mockOpen ).not.toHaveBeenCalled();
  } );

  it( 'should close the save dialog when Stay here is clicked', () => {
    jest.mocked( useDialog ).mockReturnValue( {
      open: mockOpenSaveDialog,
      close: mockCloseSaveDialog,
      isOpen: true,
    } );

    render( <DefaultStylesOpenGate /> );

    fireEvent.click( screen.getByRole( 'button', { name: 'Stay here' } ) );

    expect( mockCloseSaveDialog ).toHaveBeenCalled();
    expect( mockOpen ).not.toHaveBeenCalled();
  } );

  it( 'should save the document and open the panel when Save & Continue is clicked', async () => {
    mockUseActiveDocument.mockReturnValue( { isDirty: true } );

    jest.mocked( useDialog ).mockReturnValue( {
      open: mockOpenSaveDialog,
      close: mockCloseSaveDialog,
      isOpen: true,
    } );

    render( <DefaultStylesOpenGate /> );

    act( () => {
      dispatchRequestOpen();
    } );

    fireEvent.click( screen.getByRole( 'button', { name: 'Save & Continue' } ) );

    await waitFor( () => {
      expect( mockSaveDocument ).toHaveBeenCalled();
      expect( mockCloseSaveDialog ).toHaveBeenCalled();
      expect( mockOpen ).toHaveBeenCalled();
    } );
  } );

  it( 'should render nothing when no dialog is open', () => {
    const { container } = render( <DefaultStylesOpenGate /> );

    expect( container ).toBeEmptyDOMElement();
  } );
} );
