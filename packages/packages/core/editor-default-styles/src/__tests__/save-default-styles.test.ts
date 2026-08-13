import { createMockStyleDefinitionWithVariants } from 'test-utils';
import {
  __createStore as createStore,
  __dispatch as dispatch,
  __getState as getState,
  __registerSlice as registerSlice,
} from '@elementor/store';

import { apiClient } from '../api';
import { saveDefaultStyles } from '../save-default-styles';
import { selectInitialData, selectIsDirty, slice } from '../store';

jest.mock( '../api' );

describe( 'saveDefaultStyles', () => {
  beforeEach( () => {
    registerSlice( slice );
    createStore();

    jest.mocked( apiClient.put ).mockResolvedValue( {} as never );
    jest.mocked( apiClient.delete ).mockResolvedValue( {} as never );
  } );

  it( 'should persist changed tags and commit the store', async () => {
    const style = createMockStyleDefinitionWithVariants( {
      id: 'h2',
      variants: [
        {
          meta: { breakpoint: 'desktop', state: null },
          props: { 'font-size': '12px' },
          custom_css: null,
        },
      ],
    } );

    dispatch(
      slice.actions.load( {
        data: {},
      } )
    );

    dispatch( slice.actions.update( { style } ) );

    await saveDefaultStyles();

    expect( apiClient.put ).toHaveBeenCalledWith( 'h2', style.variants );
    expect( selectIsDirty( getState() ) ).toBe( false );
    expect( selectInitialData( getState() ) ).toEqual( { h2: style } );
  } );

  it( 'should persist edits to pre-loaded tags', async () => {
    const style = createMockStyleDefinitionWithVariants( {
      id: 'h2',
      variants: [
        {
          meta: { breakpoint: 'desktop', state: null },
          props: { 'font-size': '12px' },
          custom_css: null,
        },
      ],
    } );

    dispatch(
      slice.actions.load( {
        data: { h2: style },
      } )
    );

    dispatch(
      slice.actions.updateProps( {
        id: 'h2',
        meta: { breakpoint: 'desktop', state: null },
        props: { 'font-size': '24px' },
      } )
    );

    await saveDefaultStyles();

    expect( apiClient.put ).toHaveBeenCalledWith( 'h2', [
      {
        meta: { breakpoint: 'desktop', state: null },
        props: { 'font-size': '24px' },
        custom_css: null,
      },
    ] );
    expect( selectIsDirty( getState() ) ).toBe( false );
  } );

  it( 'should delete tags removed from the store', async () => {
    const style = createMockStyleDefinitionWithVariants( { id: 'h2' } );

    dispatch(
      slice.actions.load( {
        data: { h2: style },
      } )
    );

    dispatch( slice.actions.deleteTag( 'h2' ) );

    await saveDefaultStyles();

    expect( apiClient.delete ).toHaveBeenCalledWith( 'h2' );
    expect( selectIsDirty( getState() ) ).toBe( false );
  } );

  it( 'should not call the API when the store is clean', async () => {
    dispatch(
      slice.actions.load( {
        data: {},
      } )
    );

    await saveDefaultStyles();

    expect( apiClient.put ).not.toHaveBeenCalled();
    expect( apiClient.delete ).not.toHaveBeenCalled();
  } );
} );
