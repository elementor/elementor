import { stylesRepository } from '@elementor/editor-styles-repository';
import { __createStore as createStore, __registerSlice as registerSlice } from '@elementor/store';

import {
  DEFAULT_STYLES_PROVIDER_KEY,
  defaultStylesStylesProvider,
} from '../default-styles-styles-provider';
import { slice } from '../store';

describe( 'defaultStylesStylesProvider', () => {
  beforeEach( () => {
    (
      window as unknown as {
        elementor: { config: { atomic: { default_styles: { allowed_tags: string[] } } } };
      }
     ).elementor = {
      config: {
        atomic: {
          default_styles: {
            allowed_tags: [ 'h1', 'h2' ],
          },
        },
      },
    };

    registerSlice( slice );
    createStore();
    stylesRepository.register( defaultStylesStylesProvider );
  } );
  it( 'registers with priority between base and global', () => {
    const provider = stylesRepository
      .getProviders()
      .find( ( entry ) => entry.getKey() === DEFAULT_STYLES_PROVIDER_KEY );

    expect( provider ).toBeDefined();
    expect( provider?.priority ).toBe( 15 );
  } );

  it( 'returns class style definitions with prefixed cssName from all()', () => {
    const all = defaultStylesStylesProvider.actions.all();

    expect( all.length ).toBeGreaterThan( 0 );
    expect( all[ 0 ].type ).toBe( 'class' );
    expect( all[ 0 ].id ).toBeTruthy();
    expect( defaultStylesStylesProvider.actions.resolveCssName( all[ 0 ].id ) ).toBe(
      `e-default-${ all[ 0 ].id }`
    );
  } );
} );
