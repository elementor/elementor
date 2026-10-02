import { useState } from 'react';
import {
  type ElementStateParam,
  type ElementStateValues,
  getElementState,
  getElementStateParams,
  updateElementState,
  updateElementStateParams,
} from '@elementor/editor-elements';

const NEW_STATE_PARAM: ElementStateParam = { key: '', label: '', type: 'string', default: '' };

export const useElementStateParams = ( elementId: string ) => {
  const [ stateParams, setStateParams ] = useState< ElementStateParam[] >( () =>
    getElementStateParams( elementId )
  );

  const saveStateParams = ( nextStateParams: ElementStateParam[] ) => {
    setStateParams( nextStateParams );
    updateElementStateParams( { elementId, stateParams: nextStateParams } );
  };

  return {
    stateParams,
    saveStateParams,
    addStateParam: () => saveStateParams( [ ...stateParams, NEW_STATE_PARAM ] ),
    updateStateParam: ( index: number, changes: Partial< ElementStateParam > ) =>
      saveStateParams(
        stateParams.map( ( param, paramIndex ) =>
          paramIndex === index ? { ...param, ...changes } : param
        )
      ),
    removeStateParam: ( index: number ) =>
      saveStateParams( stateParams.filter( ( _, paramIndex ) => paramIndex !== index ) ),
  };
};

export const useElementStateValues = ( elementId: string ) => {
  const [ state, setState ] = useState< ElementStateValues >( () => getElementState( elementId ) );

  const saveState = ( nextState: ElementStateValues ) => {
    setState( nextState );
    updateElementState( { elementId, state: nextState } );
  };

  return {
    state,
    setValue: ( key: string, value: unknown ) => saveState( { ...state, [ key ]: value } ),
    clearValue: ( key: string ) => {
      const { [ key ]: _cleared, ...nextState } = state;

      saveState( nextState );
    },
  };
};
