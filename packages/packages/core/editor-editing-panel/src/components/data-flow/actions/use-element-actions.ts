import { useState } from 'react';
import { getElementActions, updateElementActions } from '@elementor/editor-elements';

import { getActionArgsSchema } from './action-definitions';
import { actionsToProps, type PlainAction, propsToActions } from './actions-props';

export const useElementActions = ( elementId: string ) => {
  const [ actions, setActions ] = useState< PlainAction[] >( () =>
    propsToActions( getElementActions( elementId ).items )
  );

  const saveActions = ( nextActions: PlainAction[] ) => {
    setActions( nextActions );
    updateElementActions( {
      elementId,
      items: actionsToProps( nextActions, getActionArgsSchema ),
    } );
  };

  return {
    actions,
    addAction: ( action: PlainAction ) => saveActions( [ ...actions, action ] ),
    updateAction: ( index: number, action: PlainAction ) =>
      saveActions(
        actions.map( ( current, actionIndex ) => ( actionIndex === index ? action : current ) )
      ),
    removeAction: ( index: number ) =>
      saveActions( actions.filter( ( _, actionIndex ) => actionIndex !== index ) ),
  };
};
