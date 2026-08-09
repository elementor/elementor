import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { ListItemsControlContent } from '../list-items-control';

type RepeaterProps = {
  showRemove: boolean;
  itemSettings: {
    Content: React.ComponentType< {
      value: { id: string; title: string };
      index: number;
      anchorEl: HTMLElement | null;
      bind: string;
    } >;
  };
};

const mockRepeater = jest.fn< ( props: unknown ) => null >( () => null );
const mockGetContainer = jest.fn< ( elementId: string ) => unknown >( () => undefined );
const mockGetElementChildren = jest.fn< ( model: unknown, predicate: unknown ) => unknown[] >(
  () => []
);
const mockUseElementEditorSettings = jest.fn< ( elementId: string ) => { label?: string } >(
  () => ( {
    label: 'Item 1',
  } )
);
let capturedRepeaterProps: unknown;

jest.mock( '@elementor/editor-v1-adapters', () => ( {
  __privateUseListenTo: ( _events: unknown[], getValue: () => unknown ) => getValue(),
  commandEndEvent: ( command: string ) => command,
  v1ReadyEvent: () => 'ready',
  windowEvent: ( event: string ) => event,
} ) );

jest.mock( '@elementor/editor-controls', () => ( {
  Repeater: ( props: unknown ) => {
    capturedRepeaterProps = props;
    mockRepeater( props );
    return null;
  },
  ControlFormLabel: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
  getContainer: ( elementId: string ) => mockGetContainer( elementId ),
  getElementChildrenWithFallback: ( model: unknown, predicate: unknown ) =>
    mockGetElementChildren( model, predicate ),
  updateElementEditorSettings: jest.fn(),
  useElementEditorSettings: ( elementId: string ) => mockUseElementEditorSettings( elementId ),
} ) );

jest.mock( '../../../../contexts/element-context', () => ( {
  useElement: () => ( { element: { id: 'list-1' } } ),
} ) );

jest.mock( '../use-actions', () => ( {
  LIST_ITEM_ELEMENT_TYPE: 'e-list-item',
  useActions: () => ( {
    addItem: jest.fn(),
    duplicateItem: jest.fn(),
    moveItem: jest.fn(),
    removeItem: jest.fn(),
  } ),
} ) );

describe( 'ListItemsControlContent', () => {
  beforeEach( () => {
    jest.clearAllMocks();
    capturedRepeaterProps = undefined;
    mockGetContainer.mockReturnValue( { id: 'list-1', model: {} } );
    mockUseElementEditorSettings.mockReturnValue( { label: 'Item 1' } );
  } );

  it( 'hides remove when only one item exists', () => {
    mockGetElementChildren.mockReturnValue( [
      {
        model: {
          get: ( key: string ) => {
            if ( key === 'id' ) {
              return 'item-1';
            }

            if ( key === 'editor_settings' ) {
              return { label: 'Item 1' };
            }

            return undefined;
          },
        },
      },
    ] );

    render( <ListItemsControlContent label="List Items" /> );

    expect( ( capturedRepeaterProps as RepeaterProps ).showRemove ).toBe( false );
  } );

  it( 'shows remove when multiple items exist', () => {
    mockGetElementChildren.mockReturnValue( [
      {
        model: {
          get: ( key: string ) => {
            if ( key === 'id' ) {
              return 'item-1';
            }

            if ( key === 'editor_settings' ) {
              return { label: 'Item 1' };
            }

            return undefined;
          },
        },
      },
      {
        model: {
          get: ( key: string ) => {
            if ( key === 'id' ) {
              return 'item-2';
            }

            if ( key === 'editor_settings' ) {
              return { label: 'Item 2' };
            }

            return undefined;
          },
        },
      },
    ] );

    render( <ListItemsControlContent label="List Items" /> );

    expect( ( capturedRepeaterProps as RepeaterProps ).showRemove ).toBe( true );
  } );

  it( 'populates the popover input with the effective item label when editor settings are empty', () => {
    mockGetElementChildren.mockReturnValue( [
      {
        model: {
          get: ( key: string ) => {
            if ( key === 'id' ) {
              return 'item-1';
            }

            if ( key === 'editor_settings' ) {
              return {};
            }

            return undefined;
          },
        },
      },
    ] );
    mockUseElementEditorSettings.mockReturnValue( {} );

    render( <ListItemsControlContent label="List Items" /> );

    if ( ! capturedRepeaterProps ) {
      throw new Error( 'Repeater props were not captured' );
    }

    const Content = ( capturedRepeaterProps as RepeaterProps ).itemSettings.Content;

    render(
      <Content
        value={ { id: 'item-1', title: 'Item 1' } }
        index={ 0 }
        anchorEl={ null }
        bind="ignored"
      />
    );

    expect( screen.getByDisplayValue( 'Item 1' ) ).toBeInTheDocument();
  } );
} );
